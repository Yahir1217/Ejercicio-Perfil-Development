import { Component, AfterViewInit, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { ApiService } from '../../servicios/api.service';
import { Reserva } from '../../interface/reserva';
import { Sala } from '../../interface/sala';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';


@Component({
  selector: 'app-vista-principal',
  standalone: true,
  imports: [],
  templateUrl: './vista-principal.component.html',
  styleUrl: './vista-principal.component.css'
})
export class VistaPrincipalComponent implements AfterViewInit, OnInit {
  reservas: Reserva[] = [];

  constructor(private apiService: ApiService) {}


  ngOnInit() {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (token) {
        this.obtenerReservas();
      } else {
        console.warn('Token no disponible todavía, no se llamó a obtenerSalas().');
      }
    }
  }
  

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (token) {
        this.initLineChart(); 
        this.initPieChart();
        this.initBarChart();
      } else {
        console.warn('Token no disponible todavía, no se llamaron a las gráficas.');
      }
    }
  }
  

  obtenerReservas(): void {
    this.apiService.obtenerReservas2().subscribe({
      next: (data) => {
        this.reservas = data;
        this.initLineChart(); 
        this.initBarChart(); 
        this.initPieChart();
      },
      error: (error) => {
        console.error('Error al obtener reservas:', error);
      }
    });
  }

  private initLineChart(): void {
    const chartDom = document.getElementById('chart-line'); 
    if (!chartDom) return;
    
    const instanciaExistente = echarts.getInstanceByDom(chartDom);
    if (instanciaExistente) {
      echarts.dispose(chartDom);
    }
    
    const myChart = echarts.init(chartDom);
    const dias = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  
    const hoy = new Date();
    const startOfWeek = new Date(hoy);
    startOfWeek.setDate(hoy.getDate() - hoy.getDay()); 
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); 
  
    const conteoPorSala: { [salaNombre: string]: number[] } = {};
  
    this.reservas.forEach((reserva: any) => {
      const fecha = new Date(reserva.inicio);
      const sala = reserva.sala?.nombre;
  
      if (!sala || fecha < startOfWeek || fecha > endOfWeek) return;
  
      if (!conteoPorSala[sala]) {
        conteoPorSala[sala] = [0, 0, 0, 0, 0, 0, 0]; 
      }
  
      const dia = fecha.getDay(); 
      conteoPorSala[sala][dia]++;
    });
  
    
    const series = Object.keys(conteoPorSala).map((salaNombre) => ({
      name: salaNombre,
      type: 'line',
      data: conteoPorSala[salaNombre]
    }));
  
    const option = {
      tooltip: { trigger: 'axis' },
      legend: {
        data: Object.keys(conteoPorSala)
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      toolbox: { feature: { saveAsImage: {} } },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dias
      },
      yAxis: { type: 'value' },
      series: series
    };
  
    myChart.setOption(option);
  }
  
  
  
  private initPieChart(): void {
    const chartDom = document.getElementById('chart-pie'); 
    if (!chartDom) return;
    
    const instanciaExistente = echarts.getInstanceByDom(chartDom);
    if (instanciaExistente) {
      echarts.dispose(chartDom);
    }
    
    const myChart = echarts.init(chartDom);
  
    const conteoSalas: { [nombre: string]: number } = {};
  
    this.reservas.forEach((reserva: any) => {
      if (!reserva.sala || !reserva.sala.nombre) return;
  
      const nombreSala = reserva.sala.nombre;
  
      if (!conteoSalas[nombreSala]) conteoSalas[nombreSala] = 0;
      conteoSalas[nombreSala]++;
    });
  
    const dataSeries = Object.entries(conteoSalas).map(([nombre, cantidad]) => ({
      name: nombre,
      value: cantidad
    }));
    
    const option = {
      tooltip: { trigger: 'item' },
      legend: { top: '5%', left: 'center' },
      series: [
        {
          name: 'Reservas por Sala',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '70%'],
          startAngle: 180,
          endAngle: 360,
          data: dataSeries,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  
    myChart.setOption(option);
  }
  
  
  private initBarChart(): void {
    const chartDom = document.getElementById('chart-bar'); 
    if (!chartDom) return;
    
    const instanciaExistente = echarts.getInstanceByDom(chartDom);
    if (instanciaExistente) {
      echarts.dispose(chartDom);
    }
    
    const myChart = echarts.init(chartDom);
    
  
    const hoy = new Date();
    const mesActual = hoy.getMonth(); 
    const añoActual = hoy.getFullYear();
  
    const conteoUsuarios: { [nombre: string]: number } = {};
  
    this.reservas.forEach((reserva: any) => {
      if (!reserva.inicio || !reserva.user?.name) return;
  
      const fechaParts = reserva.inicio.split(/[- :]/);
      const fecha = new Date(
        parseInt(fechaParts[0]),
        parseInt(fechaParts[1]) - 1,
        parseInt(fechaParts[2]),
        parseInt(fechaParts[3]),
        parseInt(fechaParts[4]),
        parseInt(fechaParts[5])
      );
  
      if (
        fecha.getMonth() === mesActual &&
        fecha.getFullYear() === añoActual
      ) {
        const nombre = reserva.user.name;
        if (!conteoUsuarios[nombre]) conteoUsuarios[nombre] = 0;
        conteoUsuarios[nombre]++;
      }
    });
  
    const topUsuarios = Object.entries(conteoUsuarios)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  
    const nombres = topUsuarios.map(([nombre]) => nombre);
    const cantidades = topUsuarios.map(([_, cantidad]) => cantidad);
  
  
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      xAxis: {
        type: 'category',
        data: nombres,
        axisLabel: { interval: 0, rotate: 20 }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: cantidades,
          type: 'bar',
          itemStyle: {
            color: '#3b82f6'
          }
        }
      ]
    };
  
    myChart.setOption(option);
  }

  generarExcel(): void {
    const reservasExport = this.reservas.map(res => {
      const reserva: any = res; 
  
      return {
        ID: reserva['id'],
        Sala: reserva['sala']?.['nombre'],
        Usuario: reserva['usuario']?.['nombre'],
        Inicio: reserva['inicio'],
        Fin: reserva['fin'],
        Duración: reserva['duracion'],
        'Fecha de Creación': reserva['created_at'],
        'Última Actualización': reserva['updated_at']
      };
    });
  
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(reservasExport);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Reservas': worksheet },
      SheetNames: ['Reservas']
    };
  
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(data, 'reservas.xlsx');
  }
  
  
}
