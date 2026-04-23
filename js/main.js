// ============================================================
//  NADINA PASTELERÍA — main.js
// ============================================================

// ---- Agregar al carrito ----
function agregarAlCarrito(nombre, precio, imagen) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const existente = carrito.find(p => p.nombre === nombre);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      nombre,
      precio,
      imagen: imagen || '',
      cantidad: 1
    });
  }

  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarBadge();
  mostrarToast('✓ ' + nombre + ' agregada al carrito');
}

// ---- Actualizar el número en el ícono del carrito ----
function actualizarBadge() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const total = carrito.reduce((acc, p) => acc + (p.cantidad || 1), 0);
  const badge = document.getElementById('carrito-count');
  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? 'inline-flex' : 'none';
  }
}


function consultarWhatsapp(boton, nombreTorta) {
    // Esta línea busca la card entera, no importa donde esté el botón
    const card = boton.closest('.card'); 
    const medida = card.querySelector('.tamanio-select-custom').value;
    const cantidad = card.querySelector('.cant-input').value;
    const telefono = "5491136337422"; 
    
    const mensaje = `Hola Nadina! Me gustaría consultar por la torta personalizada: *${nombreTorta}*.%0A- *Medida:* ${medida}%0A- *Cantidad:* ${cantidad}%0AQuiero coordinar el diseño y los rellenos!`;
    
    const url = `https://wa.me/${telefono}?text=${mensaje}`;
    window.open(url, '_blank');
}

function moverCarrusel(boton, direccion) {
    const wrap = boton.parentElement; // El .card-img-wrap
    const anchoImagen = wrap.offsetWidth;
    
    if (direccion === 1) {
        // Desliza hacia la derecha
        wrap.scrollTo({
            left: anchoImagen,
            behavior: 'smooth'
        });
    } else {
        // Desliza hacia la izquierda
        wrap.scrollTo({
            left: 0,
            behavior: 'smooth'
        });
    }
}

// ---- Toast de confirmación ----
function mostrarToast(mensaje) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

// ---- Lógica de precios y talles (NUEVO) ----

function actualizarPrecioCard(selectElement) {
  const precio = selectElement.options[selectElement.selectedIndex].getAttribute('data-precio');
  const cardBody = selectElement.closest('.card-body');
  const display = cardBody.querySelector('.precio-display');
  if (display) {
    display.textContent = `$${parseInt(precio).toLocaleString('es-AR')}`;
  }
}

function prepararCompra(boton, nombreBase, imagen) {
  const cardBody = boton.closest('.card-body');
  const selector = cardBody.querySelector('.tamanio-select');
  
  // AQUÍ ESTABA EL ERROR: se cambió "tam seleccionado" por "tamanioSeleccionado"
  const tamanioSeleccionado = selector.value; 
  const opcionSeleccionada = selector.options[selector.selectedIndex];
  const porciones = opcionSeleccionada.getAttribute('data-porciones') || "6-8"; // Un default por si te olvidas alguno
  const precio = parseInt(opcionSeleccionada.getAttribute('data-precio'));
  const nombreCompleto = `${nombreBase} (${tamanioSeleccionado}cm - ${porciones} porc.)`;
  
  agregarAlCarrito(nombreCompleto, precio, imagen);
}

// ---- Al cargar la página ----
document.addEventListener('DOMContentLoaded', () => {
  actualizarBadge();

  // Configurar fecha mínima de entrega (Hoy + 2 días)
  const inputFecha = document.getElementById('fecha');
  if (inputFecha) {
    const minFecha = new Date();
    minFecha.setDate(minFecha.getDate() + 2);
    // Formato ISO YYYY-MM-DD
    const stringFecha = minFecha.toISOString().split('T')[0];
    inputFecha.min = stringFecha;
  }
});