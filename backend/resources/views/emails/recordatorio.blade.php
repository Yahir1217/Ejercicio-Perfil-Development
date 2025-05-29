<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; padding: 20px; }
    .container { background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    h2 { color: #1a73e8; }
  </style>
</head>
<body>
  <div class="container">
    <h2>¡Recordatorio de Reserva!</h2>
    <p>Hola {{ $usuario }},</p>
    <p>Este es un recordatorio de que tu reserva de sala <strong>{{ $sala }}</strong> comenzará en 15 minutos.</p>
    <p><strong>Fecha:</strong> {{ $fecha }}<br>
    <strong>Hora de inicio:</strong> {{ $hora_inicio }}</p>
    <p>Por favor asegúrate de estar listo.</p>
    <p>Saludos,<br>Equipo de Salas</p>
  </div>
</body>
</html>
