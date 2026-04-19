<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold mb-0">Resumen General</h3>
      <button class="btn btn-brand"><i class="bi bi-plus-lg me-2"></i>Nuevo Pedido</button>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card card-custom h-100 p-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted-custom mb-1 small fw-bold">EN PRODUCCIÓN</p>
              <h3 class="mb-0 fw-bold">12</h3>
            </div>
            <div class="bg-warning bg-opacity-10 text-warning rounded-circle p-3">
              <i class="bi bi-tools fs-4"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card card-custom h-100 p-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted-custom mb-1 small fw-bold">LISTOS PARA DESPACHO</p>
              <h3 class="mb-0 fw-bold">5</h3>
            </div>
            <div class="bg-info bg-opacity-10 text-info rounded-circle p-3">
              <i class="bi bi-box-seam fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card card-custom h-100 p-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted-custom mb-1 small fw-bold">INGRESOS DEL MES</p>
              <h3 class="mb-0 fw-bold">Bs. 45,200</h3>
            </div>
            <div class="bg-success bg-opacity-10 text-success rounded-circle p-3">
              <i class="bi bi-cash-stack fs-4"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card card-custom">
      <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
        <h5 class="fw-bold">Pedidos Recientes</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="text-muted small">
              <tr>
                <th>N° ORDEN</th>
                <th>CLIENTE</th>
                <th>ESTADO</th>
                <th>FECHA ENTREGA</th>
                <th>MONTO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="fw-bold text-brand">#ORD-001</td>
                <td>Empresa Multilider S.A.</td>
                <td><span class="badge bg-warning text-dark">En Producción</span></td>
                <td>25 Abr 2026</td>
                <td class="fw-bold">Bs. 4,000</td>
              </tr>
              <tr>
                <td class="fw-bold text-brand">#ORD-002</td>
                <td>Juan Pérez</td>
                <td><span class="badge bg-info text-dark">Listo p/ Despacho</span></td>
                <td>20 Abr 2026</td>
                <td class="fw-bold">Bs. 250</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>