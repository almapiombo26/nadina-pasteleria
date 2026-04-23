// ============================================================
//  NADINA PASTELERÍA — carrito.js
// ============================================================

let metodoPago = 'transferencia';

const imagenesTortas = {
  'Torta Matilda': 'img/torta-matilda.jpeg',
  'Torta Chajá': 'img/chaja1.jpeg',
  'Red Velvet': 'img/redvelvet-1.jpeg',
  'Chocooreo': 'img/chocooreo1.jpeg',
  'Torta de Cumpleaños': 'img/cumple1.jpeg',
  'Brownie con Frutos Rojos': 'img/brownie1.jpeg', // Asegurate que coincida con el HTML
  'Key Lime Pie': 'img/keylimepie.jpeg',
  'Carrot Cake': 'img/carrot.jpeg'
};

const fallbackImg = 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=200&h=200&fit=crop';

function mostrarCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contenedor = document.getElementById('carrito-contenedor');
  if (!contenedor) return;

  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <div class="carrito-vacio">
        <p>Tu carrito está vacío 🌿</p>
        <a href="tortas.html" class="btn">Ver tortas</a>
      </div>`;
    actualizarTotales(carrito);
    return;
  }

  contenedor.innerHTML = carrito.map((producto, index) => {
    const img = producto.imagen || imagenesTortas[producto.nombre.split(' (')[0]] || fallbackImg;
    const subtotalItem = producto.precio * (producto.cantidad || 1);
    return `
      <div class="item-carrito">
        <img src="${img}" alt="${producto.nombre}" onerror="this.src='${fallbackImg}'">
        <div class="item-info">
          <h4>${producto.nombre}</h4>
          <span class="item-detalle">Torta entera</span>
          <div class="item-controles">
            <button onclick="cambiarCantidad(${index}, -1)">−</button>
            <span class="cantidad-num">${producto.cantidad || 1}</span>
            <button onclick="cambiarCantidad(${index}, 1)">+</button>
          </div>
        </div>
        <span class="item-precio">$${subtotalItem.toLocaleString('es-AR')}</span>
        <button class="item-eliminar" onclick="eliminarProducto(${index})">✕</button>
      </div>`;
  }).join('');

  actualizarTotales(carrito);
  actualizarBadgeHeader(carrito);
}

function cambiarCantidad(index, cambio) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito[index].cantidad = (carrito[index].cantidad || 1) + cambio;
  if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  mostrarCarrito();
}

function eliminarProducto(index) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  mostrarCarrito();
}

function actualizarTotales(carrito) {
  const subtotal = carrito.reduce((acc, p) => acc + p.precio * (p.cantidad || 1), 0);
  const recargo = metodoPago === 'transferencia' ? subtotal * 0.10 : 0;
  const total = subtotal + recargo;

  document.getElementById('subtotal').textContent = '$' + subtotal.toLocaleString('es-AR');
  document.getElementById('recargo').textContent = recargo > 0 ? '+$' + recargo.toLocaleString('es-AR') : '$0';
  document.getElementById('total').textContent = '$' + Math.round(total).toLocaleString('es-AR');
}

function seleccionarPago(tipo) {
  metodoPago = tipo;
  document.querySelectorAll('.pago-opcion').forEach(el => el.classList.remove('activo'));
  const activo = document.querySelector(`.pago-opcion[data-pago="${tipo}"]`);
  if (activo) activo.classList.add('activo');
  actualizarTotales(JSON.parse(localStorage.getItem('carrito')) || []);
}

function actualizarBadgeHeader(carrito) {
  const badge = document.getElementById('carrito-count');
  if (!badge) return;
  const total = carrito.reduce((acc, p) => acc + (p.cantidad || 1), 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? 'inline-flex' : 'none';
}

function enviarWhatsApp() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const fecha = document.getElementById('fecha')?.value;
  const horario = document.getElementById('horario')?.value;
  if (carrito.length === 0) return alert('Tu carrito está vacío.');
  if (!fecha) return alert('Por favor seleccioná una fecha de retiro.');

  // Formateamos la fecha
  const fechaFormateada = fecha.split('-').reverse().join('/');
  
  const subtotal = carrito.reduce((acc, p) => acc + p.precio * (p.cantidad || 1), 0);
  const total = metodoPago === 'transferencia' ? Math.round(subtotal * 1.10) : subtotal;
  
  let mensaje = `¡Hola Nadina! Quiero confirmar un pedido de torta entera\n\n`;
  mensaje += `*Detalle:*\n`;
  carrito.forEach(p => {
    mensaje += `• ${p.nombre} x${p.cantidad} — $${(p.precio * p.cantidad).toLocaleString('es-AR')}\n`;
  });
  mensaje += `\n*Retiro en Palermo* (Costa Rica 4824)`;
  mensaje += `\n*Fecha:* ${fechaFormateada}`;
  mensaje += `\n*Horario:* ${horario}`;
  mensaje += `\n*Pago:* ${metodoPago === 'transferencia' ? 'Transferencia (+10%)' : 'Efectivo'}`;
  mensaje += `\n\n*Total: $${total.toLocaleString('es-AR')}*`;
  const url = `https://wa.me/5491136337422?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  const inputFecha = document.getElementById('fecha');
  const btnFinalizar = document.querySelector('.btn-finalizar');
  const errorMsg = document.getElementById('error-fecha');
  if (inputFecha) {
    const hoy = new Date();
    const minEntrega = new Date(hoy);
    minEntrega.setDate(hoy.getDate() + 2); 
    const anio = minEntrega.getFullYear();
    const mes = String(minEntrega.getMonth() + 1).padStart(2, '0');
    const dia = String(minEntrega.getDate()).padStart(2, '0');
    inputFecha.min = `${anio}-${mes}-${dia}`;
    inputFecha.addEventListener('change', function() {
      const fechaSeleccionada = new Date(this.value + 'T00:00:00');
      const diaSemana = fechaSeleccionada.getUTCDay();
      if (diaSemana === 1) {
        if (errorMsg) {
          errorMsg.textContent = "⚠️ Los lunes el local está cerrado para retiros.";
          errorMsg.style.display = 'block';
        }
        btnFinalizar.style.opacity = '0.5';
        btnFinalizar.style.pointerEvents = 'none';
        this.style.borderColor = '#b94040';
      } else {
        if (errorMsg) errorMsg.style.display = 'none';
        btnFinalizar.style.opacity = '1';
        btnFinalizar.style.pointerEvents = 'auto';
        this.style.borderColor = ''; // Vuelve al color original del CSS
        }
      });
    }
    mostrarCarrito();
    
    document.querySelectorAll('.pago-opcion').forEach(el => {
    
      el.addEventListener('click', function(e) {
        const radio = this.querySelector('input');
        if (radio) {
          radio.checked = true;
          seleccionarPago(this.dataset.pago);
        }
      });
    });
  });