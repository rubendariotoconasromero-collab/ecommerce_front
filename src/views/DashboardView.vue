<template>
  <div class="animate__animated animate__fadeIn">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-4">
      <div>
        <h2 class="fw-800 mb-0 text-body-emphasis lh-1">Resumen General</h2>
        <p class="text-body-secondary mt-2 mb-0">Monitoreo en tiempo real de producción y ventas.</p>
      </div>
      <BaseButton variant="brand" class="rounded-pill px-4 py-2 fw-bold shadow-brand-sm">
        <i class="fa-solid fa-plus me-2"></i> Nuevo Pedido Maestro
      </BaseButton>
    </div>

    <!-- Stat Cards Premium -->
    <div class="row g-4 mb-5">
      <div class="col-12 col-sm-6 col-xl-4" v-for="(stat, index) in stats" :key="index">
        <div class="card premium-stat-card border-0 h-100 p-4 transition-all shadow-soft" :class="stat.colorClass">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <p class="smaller fw-800 text-uppercase tracking-wider opacity-75 mb-1">{{ stat.label }}</p>
              <h2 class="fw-800 mb-0">{{ stat.value }}</h2>
              <div class="mt-2 d-flex align-items-center gap-2" v-if="stat.trend">
                <span class="badge rounded-pill bg-white bg-opacity-25 smallest fw-800">
                  <i class="fa-solid fa-arrow-trend-up me-1"></i> {{ stat.trend }}
                </span>
                <span class="smallest opacity-50">vs mes anterior</span>
              </div>
            </div>
            <div class="stat-icon-box shadow-sm">
              <i :class="[stat.icon, 'fs-4']"></i>
            </div>
          </div>
          <!-- Decorative Background Element -->
          <div class="stat-blob position-absolute"></div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="card border-0 rounded-5 shadow-soft overflow-hidden">
      <div class="card-header bg-white border-bottom-0 pt-5 px-5 pb-0">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="fw-800 mb-0 text-body-emphasis">Pedidos Recientes</h5>
          <BaseButton variant="light" size="sm" class="rounded-pill px-3">Ver Todo <i class="fa-solid fa-chevron-right ms-1 smaller"></i></BaseButton>
        </div>
      </div>
      <div class="card-body px-5 pb-5">
        <div class="table-responsive">
          <table class="table table-hover align-middle custom-premium-table">
            <thead>
              <tr class="smaller text-muted fw-800 text-uppercase tracking-wider">
                <th class="border-0 ps-0">PEDIDO</th>
                <th class="border-0">CLIENTE</th>
                <th class="border-0">ESTADO</th>
                <th class="border-0">FECHA</th>
                <th class="border-0 text-end pe-0">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td class="ps-0"><span class="fw-800 text-brand">{{ order.id }}</span></td>
                <td>
                  <div class="fw-bold text-body-emphasis">{{ order.client }}</div>
                  <span class="smallest text-muted d-block d-md-none">{{ order.address }}</span>
                </td>
                <td>
                  <span :class="['badge rounded-pill px-3 py-1 sol-fw-800 sol-smallest text-uppercase sol-tracking-tight border', getStatusBadgeClass(order.status)]">
                    <i v-if="order.status === 'pending'" class="fa-solid fa-clock me-1"></i>
                    <i v-else-if="order.status === 'in_production'" class="fa-solid fa-gears me-1"></i>
                    <i v-else-if="order.status === 'ready'" class="fa-solid fa-box-open me-1"></i>
                    <i v-else class="fa-solid fa-circle-check me-1"></i>
                    {{ getStatusLabel(order.status) }}
                  </span>
                </td>
                <td class="text-body-secondary small">{{ order.date }}</td>
                <td class="text-end pe-0">
                  <div class="fw-800 fs-6 text-body-emphasis mb-1">Bs. {{ parseFloat(order.total).toLocaleString('es-BO', {minimumFractionDigits: 2}) }}</div>
                  
                  <!-- Selector de estado interactivo para ver reactividad en tiempo real -->
                  <div class="d-flex justify-content-end">
                    <select 
                      class="form-select form-select-sm smallest py-0 px-2 shadow-none" 
                      style="font-size: 0.75rem; height: 24px; width: 130px;"
                      :value="order.status"
                      @change="updateOrderStatus(order, $event.target.value)"
                      aria-label="Actualizar estado"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="in_production">En Inyección</option>
                      <option value="ready">Listo en Galpón</option>
                      <option value="delivered">Despachado</option>
                    </select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import BaseButton from '../components/base/BaseButton.vue';

// Pedidos por defecto (mock inicial)
const defaultOrders = [
  { id: 'SOLUPLAST-045', client: 'Corporación Minera del Sur', status: 'in_production', address: 'Campamento Central, Planta B', total: 18500.00, date: '25 Abr 2026' },
  { id: 'SOLUPLAST-046', client: 'Distribuidora AgroPlast SRL', status: 'ready', address: 'Almacén Auxiliar Nro. 3', total: 4200.00, date: '20 Abr 2026' },
  { id: 'SOLUPLAST-047', client: 'Servicios de Fluidos Industriales', status: 'delivered', address: 'Zona Franca El Alto', total: 54900.00, date: '15 Abr 2026' }
];

const orders = ref([]);

const loadOrders = () => {
  const simulated = JSON.parse(localStorage.getItem('soluplast_simulated_orders') || '[]');
  // Mapeamos los pedidos simulados al formato de la tabla
  const formattedSimulated = simulated.map(o => ({
    id: `SOLUPLAST-${o.id}`,
    client: o.client,
    status: o.status,
    address: o.address,
    total: o.total,
    date: new Date(o.created_at).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
  }));
  orders.value = [...formattedSimulated, ...defaultOrders];
};

const updateOrderStatus = (order, newStatus) => {
  // Si es un pedido simulado, actualizar en localStorage
  const orderIdNumber = parseInt(order.id.replace('SOLUPLAST-', ''));
  if (!isNaN(orderIdNumber)) {
    const simulated = JSON.parse(localStorage.getItem('soluplast_simulated_orders') || '[]');
    const found = simulated.find(o => o.id === orderIdNumber);
    if (found) {
      found.status = newStatus;
      localStorage.setItem('soluplast_simulated_orders', JSON.stringify(simulated));
    }
  }
  
  order.status = newStatus;
};

// Métricas calculadas dinámicamente en tiempo real
const stats = computed(() => {
  const inProductionCount = orders.value.filter(o => o.status === 'in_production').length;
  const readyCount = orders.value.filter(o => o.status === 'ready').length;
  
  // Suma del total de pedidos con estatus 'delivered' + ingresos base
  const deliveredSum = orders.value
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 45200.00);

  return [
    { 
      label: 'En Producción', 
      value: inProductionCount.toString(), 
      icon: 'fa-solid fa-industry', 
      colorClass: 'stat-warning',
      trend: '+8%'
    },
    { 
      label: 'Listos para Despacho', 
      value: readyCount.toString().padStart(2, '0'), 
      icon: 'fa-solid fa-box-open', 
      colorClass: 'stat-info',
      trend: '+12%'
    },
    { 
      label: 'Ingresos del Mes', 
      value: `Bs. ${deliveredSum.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 
      icon: 'fa-solid fa-chart-line', 
      colorClass: 'stat-success',
      trend: '+24%'
    }
  ];
});

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending': return 'bg-danger-subtle text-danger border-danger-subtle';
    case 'in_production': return 'bg-warning-subtle text-warning border-warning-subtle';
    case 'ready': return 'bg-info-subtle text-info border-info-subtle';
    case 'delivered': return 'bg-success-subtle text-success border-success-subtle';
    default: return 'bg-light text-dark border-light-subtle';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'pending': return 'Pendiente Aprobación';
    case 'in_production': return 'En Inyección';
    case 'ready': return 'Listo en Galpón';
    case 'delivered': return 'Despachado';
    default: return status;
  }
};

onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.fw-800 { font-weight: 800; }
.smaller { font-size: 0.8rem; }
.smallest { font-size: 0.7rem; }
.tracking-wider { letter-spacing: 0.1em; }
.shadow-soft { box-shadow: 0 10px 40px rgba(0,0,0,0.04) !important; }

.premium-stat-card {
  border-radius: 2rem !important;
  position: relative;
  overflow: hidden;
  color: white;
}

.stat-warning { background: linear-gradient(135deg, var(--color-warning), #d97706); }
.stat-info { background: linear-gradient(135deg, var(--color-info), #0284c7); }
.stat-success { background: linear-gradient(135deg, var(--color-success), #059669); }

.stat-icon-box {
  width: 54px;
  height: 54px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-blob {
  width: 150px;
  height: 150px;
  background: white;
  opacity: 0.1;
  border-radius: 50%;
  top: -50px;
  right: -50px;
}

.premium-stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
}

.bg-warning-soft { background: rgba(245, 158, 11, 0.1); }
.bg-info-soft { background: rgba(14, 165, 233, 0.1); }

.custom-premium-table th {
  padding-bottom: 1.5rem;
}

.custom-premium-table td {
  padding: 1.25rem 0.75rem;
}

.shadow-brand-sm {
  box-shadow: 0 10px 20px var(--color-primary-glass) !important;
}

.rounded-5 { border-radius: 2rem !important; }
</style>