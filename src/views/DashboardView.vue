<template>
  <div class="animate__animated animate__fadeIn">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
      <div>
        <BaseBadge variant="primary" soft class="mb-2 px-3 py-1 rounded-pill fw-bold">Centro de Operaciones</BaseBadge>
        <h2 class="fw-800 mb-0 text-body-emphasis lh-1">Resumen General</h2>
        <p class="text-body-secondary mt-2 mb-0">Monitoreo en tiempo real de producción y ventas.</p>
      </div>
      <BaseButton variant="brand" class="rounded-pill px-4 py-2 fw-bold shadow-brand-sm">
        <i class="fa-solid fa-cart-plus me-2"></i> Nuevo Pedido Maestro
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
                <th class="border-0 ps-0">Identificador</th>
                <th class="border-0">Aliado Comercial</th>
                <th class="border-0">Estado Logístico</th>
                <th class="border-0">Fecha Prometida</th>
                <th class="border-0 text-end pe-0">Monto Transado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="ps-0"><span class="fw-800 text-brand">#ORD-001</span></td>
                <td class="fw-bold">Empresa Multilider S.A.</td>
                <td>
                  <span class="badge rounded-pill bg-warning-soft text-warning px-3 py-2 fw-800 smaller">
                    <i class="fa-solid fa-gears me-1"></i> En Producción
                  </span>
                </td>
                <td class="text-body-secondary small">25 Abr 2026</td>
                <td class="text-end pe-0 fw-800 fs-6">Bs. 4,000</td>
              </tr>
              <tr>
                <td class="ps-0"><span class="fw-800 text-brand">#ORD-002</span></td>
                <td class="fw-bold">Juan Pérez E-commerce</td>
                <td>
                  <span class="badge rounded-pill bg-info-soft text-info px-3 py-2 fw-800 smaller">
                    <i class="fa-solid fa-truck-fast me-1"></i> Listo p/ Despacho
                  </span>
                </td>
                <td class="text-body-secondary small">20 Abr 2026</td>
                <td class="text-end pe-0 fw-800 fs-6">Bs. 250</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import BaseBadge from '../components/base/BaseBadge.vue';
import BaseButton from '../components/base/BaseButton.vue';

const stats = [
  { 
    label: 'En Producción', 
    value: '12', 
    icon: 'fa-solid fa-industry', 
    colorClass: 'stat-warning',
    trend: '+8%'
  },
  { 
    label: 'Listos para Despacho', 
    value: '05', 
    icon: 'fa-solid fa-box-open', 
    colorClass: 'stat-info',
    trend: '+12%'
  },
  { 
    label: 'Ingresos del Mes', 
    value: 'Bs. 45,200', 
    icon: 'fa-solid fa-chart-line', 
    colorClass: 'stat-success',
    trend: '+24%'
  }
];
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

.stat-warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
.stat-info { background: linear-gradient(135deg, #0ea5e9, #0284c7); }
.stat-success { background: linear-gradient(135deg, #10b981, #059669); }

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