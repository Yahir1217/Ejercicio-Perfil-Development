import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservasSinSalaComponent } from './reservas-sin-sala.component';

describe('ReservasSinSalaComponent', () => {
  let component: ReservasSinSalaComponent;
  let fixture: ComponentFixture<ReservasSinSalaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservasSinSalaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReservasSinSalaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
