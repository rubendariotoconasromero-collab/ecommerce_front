<template>
  <div class="animate__animated animate__fadeIn">

    <!-- ── ENCABEZADO ──────────────────────────────────────────────────── -->
    <div class="sol-page-header mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div class="d-flex align-items-center gap-3">
        <button class="btn-back-circle rounded-circle p-0 border d-flex align-items-center justify-content-center" @click="$emit('close')">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <h3 class="fw-bold mb-0 font-monospace text-body-emphasis" style="letter-spacing:-.5px;font-size:1.5rem;">
              Pedido #{{ order?.id?.slice(0,8).toUpperCase() }}
            </h3>
            <span v-if="order" class="badge rounded-pill px-3 py-1 sol-fw-800 sol-smallest border"
                  :class="STATUS_CONFIG[order.status]?.cls">
              {{ STATUS_CONFIG[order.status]?.label ?? order.status }}
            </span>
          </div>
          <p class="text-body-secondary smaller mb-0 mt-1">{{ customerName(order?.customer) }}</p>
        </div>
      </div>

      <!-- Botones de transición -->
      <div v-if="!loading && order?.allowed_transitions?.length"
           class="d-flex gap-2 flex-wrap align-items-center animate__animated animate__fadeIn">
        <button v-for="trans in visibleTransitions" :key="trans"
                class="btn btn-sm rounded-pill px-3 fw-semibold"
                :class="TRANSITION_CONFIG[trans]?.btn ?? 'btn-outline-secondary'"
                @click="initiateTransition(trans)">
          <i class="fa-solid me-1" :class="TRANSITION_CONFIG[trans]?.icon ?? 'fa-arrow-right'"></i>
          {{ TRANSITION_CONFIG[trans]?.label ?? trans }}
        </button>
      </div>
    </div>

    <!-- Spinner -->
    <div v-if="loading" class="d-flex flex-column align-items-center justify-content-center bg-card rounded-4 border p-5" style="min-height:350px;">
      <div class="spinner-border text-primary mb-3"></div>
      <p class="text-muted small mb-0">Cargando detalle del pedido…</p>
    </div>

    <!-- ── CONTENIDO ───────────────────────────────────────────────────── -->
    <div v-else-if="order" class="animate__animated animate__fadeIn">

      <!-- Alerta: producción bloqueada (auto-ready no disparará) -->
      <div v-if="needsProductionAttention"
           class="alert d-flex align-items-start gap-3 rounded-3 mb-4 p-3"
           style="background:#fffbeb;border:1px solid #fde68a;color:#78350f;">
        <i class="fa-solid fa-triangle-exclamation mt-1 flex-shrink-0"></i>
        <div>
          <strong class="d-block small">Producción incompleta</strong>
          <span class="small">Hay ítems sin producción activa. El pedido no avanzará a "Listo" automáticamente.
            Completa o re-crea la producción de los ítems faltantes, o usa el botón
            <strong>"Marcar como listo"</strong> si los productos ya están disponibles.</span>
        </div>
      </div>

      <div class="row g-4">

        <!-- ── COLUMNA IZQUIERDA ─────────────────────────────────────── -->
        <div class="col-lg-8">

          <!-- Cliente -->
          <div class="info-card rounded-4 mb-4 shadow-sm overflow-hidden">
            <div class="info-card-header">Información del Cliente</div>
            <div class="p-4">
              <div class="row g-3">
                <div class="col-sm-6">
                  <div class="label-sm">Nombre / Razón Social</div>
                  <div class="value-sm fw-bold">{{ order.customer?.business_name || order.customer?.name }}</div>
                </div>
                <div class="col-sm-6">
                  <div class="label-sm">Tipo</div>
                  <span class="badge rounded-pill px-2 py-1 sol-smallest border mt-1"
                        :class="order.customer?.customer_type === 'business'
                          ? 'bg-primary-subtle text-primary border-primary-subtle'
                          : 'bg-light text-dark border'">
                    {{ order.customer?.customer_type === 'business' ? 'Empresa' : 'Individual' }}
                  </span>
                </div>
                <div v-if="order.customer?.phone" class="col-sm-6">
                  <div class="label-sm">Teléfono</div>
                  <div class="value-sm">{{ order.customer.phone }}</div>
                </div>
                <div v-if="order.customer?.email" class="col-sm-6">
                  <div class="label-sm">Correo</div>
                  <div class="value-sm text-truncate">{{ order.customer.email }}</div>
                </div>
                <div class="col-12">
                  <div class="label-sm">Dirección de entrega</div>
                  <div class="value-sm">{{ order.shipping_address }}</div>
                </div>
                <div v-if="order.notes" class="col-12 border-top pt-3">
                  <div class="label-sm">Notas</div>
                  <div class="value-sm text-muted fst-italic">"{{ order.notes }}"</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Productos -->
          <div class="info-card rounded-4 mb-4 shadow-sm overflow-hidden">
            <div class="info-card-header">Detalle de Productos</div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-body-tertiary">
                  <tr>
                    <th class="ps-4 py-3 small fw-semibold text-muted text-uppercase">Producto</th>
                    <th class="py-3 small fw-semibold text-muted text-uppercase text-center" style="width:80px;">Cant.</th>
                    <th class="py-3 small fw-semibold text-muted text-uppercase" style="width:155px;">Stock</th>
                    <th class="py-3 small fw-semibold text-muted text-uppercase text-end" style="width:110px;">P.Unit.</th>
                    <th class="py-3 small fw-semibold text-muted text-uppercase text-end" style="width:120px;">Subtotal</th>
                    <th v-if="showProductionCol" class="pe-4 py-3 small fw-semibold text-muted text-uppercase text-center" style="width:120px;">Producción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in order.items" :key="item.id">
                    <td class="ps-4 py-3">
                      <div class="small fw-semibold text-body-emphasis">{{ item.product_name }}</div>
                      <div v-if="item.customization_notes" class="text-muted mt-1 d-flex align-items-center gap-1" style="font-size:.72rem;">
                        <i class="fa-solid fa-pen-nib text-secondary"></i>
                        <span>{{ item.customization_notes }}</span>
                      </div>
                    </td>
                    <td class="py-3 text-center small fw-semibold">{{ item.quantity }}</td>
                    <td class="py-3">
                      <template v-if="item.stock">
                        <div class="d-flex flex-column gap-1">
                          <div class="d-flex align-items-center gap-1">
                            <span class="stock-dot flex-shrink-0" :class="item.stock.available >= item.quantity ? 'bg-success' : 'bg-danger'"></span>
                            <span class="stock-label">Disp:</span>
                            <span class="fw-bold stock-value" :class="item.stock.available >= item.quantity ? 'text-success' : 'text-danger'">{{ item.stock.available }}</span>
                          </div>
                          <div class="d-flex align-items-center gap-1">
                            <span class="stock-dot flex-shrink-0 bg-secondary opacity-40"></span>
                            <span class="stock-label">Res:</span>
                            <span class="stock-value text-body-secondary">{{ item.stock.reserved }}</span>
                          </div>
                          <div v-if="item.stock.in_production > 0" class="d-flex align-items-center gap-1">
                            <span class="stock-dot flex-shrink-0 bg-info"></span>
                            <span class="stock-label">Prod:</span>
                            <span class="stock-value text-info">{{ item.stock.in_production }}</span>
                          </div>
                        </div>
                      </template>
                      <span v-else class="text-body-secondary smaller">—</span>
                    </td>
                    <td class="py-3 text-end small">Bs. {{ fmtMoney(item.unit_price) }}</td>
                    <td class="py-3 text-end small fw-bold">Bs. {{ fmtMoney(item.subtotal) }}</td>
                    <td v-if="showProductionCol" class="pe-4 py-3 text-center">
                      <button v-if="item.production_status === 'none' && item.stock && item.stock.available < item.quantity"
                              class="btn btn-prod rounded-pill px-2 py-1"
                              :disabled="producingItemId === item.id"
                              @click="produceItem(item)">
                        <span v-if="producingItemId === item.id">
                          <span class="spinner-border spinner-border-sm" style="width:.7rem;height:.7rem;"></span>
                        </span>
                        <span v-else><i class="fa-solid fa-gears me-1"></i>Producir</span>
                      </button>
                      <span v-else-if="item.production_status === 'none'" class="text-success small fw-semibold">
                        <i class="fa-solid fa-circle-check me-1"></i>Stock suficiente
                      </span>
                      <span v-else-if="item.production_status"
                            class="badge rounded-pill px-2 py-1 border sol-fw-800"
                            style="font-size:.65rem;"
                            :class="PROD_STATUS_CONFIG[item.production_status]?.cls">
                        <i class="fa-solid me-1" :class="PROD_STATUS_CONFIG[item.production_status]?.icon"></i>
                        {{ PROD_STATUS_CONFIG[item.production_status]?.label }}
                      </span>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="border-top bg-body-tertiary">
                  <tr>
                    <td :colspan="showProductionCol ? 5 : 4" class="ps-4 py-3 fw-bold text-end text-body-emphasis" style="font-size:.9rem;">Total a Pagar</td>
                    <td class="pe-4 py-3 fw-bold text-end text-primary fs-5">Bs. {{ fmtMoney(order.total_amount) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Envíos -->
          <div class="info-card rounded-4 mb-4 shadow-sm overflow-hidden">
            <div class="info-card-header d-flex align-items-center justify-content-between">
              <span>Envíos</span>
              <button v-if="canCreateShipment"
                      class="btn btn-sm btn-dark rounded-pill px-3 py-1 fw-bold"
                      style="font-size:.72rem;"
                      @click="openShipmentModal">
                <i class="fa-solid fa-truck me-1"></i>Crear envío
              </button>
            </div>
            <div class="p-4">
              <div v-if="!order.shipments?.length" class="text-center py-3">
                <i class="fa-solid fa-truck text-muted opacity-30 d-block mb-2" style="font-size:1.5rem;"></i>
                <p class="text-muted small mb-0">Sin envíos registrados</p>
              </div>
              <div v-else class="d-flex flex-column gap-3">
                <div v-for="s in order.shipments" :key="s.id"
                     class="d-flex align-items-start justify-content-between gap-3 p-3 rounded-3 bg-body-tertiary border">
                  <div class="flex-grow-1">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <span class="badge rounded-pill px-2 py-1 border sol-fw-800 sol-smallest"
                            :class="SHIPMENT_STATUS_CONFIG[s.status]?.cls">
                        {{ SHIPMENT_STATUS_CONFIG[s.status]?.label ?? s.status }}
                      </span>
                      <span v-if="s.tracking_number" class="font-monospace small fw-semibold text-body-emphasis">{{ s.tracking_number }}</span>
                    </div>
                    <div class="small text-muted">
                      <span v-if="s.courier_name">{{ s.courier_name }}</span>
                      <span v-if="s.courier_name && s.shipped_at"> · </span>
                      <span v-if="s.shipped_at">Despachado {{ fmtDate(s.shipped_at) }}</span>
                    </div>
                    <div v-if="s.failure_reason" class="small text-danger mt-1">
                      <i class="fa-solid fa-circle-xmark me-1"></i>{{ s.failure_reason }}
                    </div>
                  </div>
                  <div class="text-muted smaller flex-shrink-0">{{ fmtDate(s.created_at) }}</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- ── COLUMNA DERECHA ───────────────────────────────────────── -->
        <div class="col-lg-4">

          <!-- Datos del pedido -->
          <div class="info-card rounded-4 mb-4 shadow-sm overflow-hidden">
            <div class="info-card-header">Datos del Pedido</div>
            <div class="p-4 d-flex flex-column gap-3">
              <div class="d-flex justify-content-between border-bottom pb-2">
                <div>
                  <div class="label-sm">Creado el</div>
                  <div class="value-sm fw-semibold">{{ fmtDateLong(order.created_at) }}</div>
                </div>
              </div>
              <div v-if="order.expected_delivery_date" class="d-flex justify-content-between border-bottom pb-2">
                <div>
                  <div class="label-sm">Entrega estimada</div>
                  <div class="value-sm fw-semibold">{{ fmtDateOnly(order.expected_delivery_date) }}</div>
                </div>
              </div>
              <div v-if="order.created_by">
                <div class="label-sm">Registrado por</div>
                <div class="value-sm fw-semibold">{{ order.created_by?.name ?? 'Cliente Web' }}</div>
              </div>
            </div>
          </div>

          <!-- Pagos -->
          <div class="info-card rounded-4 mb-4 shadow-sm overflow-hidden">
            <div class="info-card-header d-flex align-items-center justify-content-between">
              <span>Pagos</span>
              <button v-if="canRegisterPayment"
                      class="btn btn-sm btn-dark rounded-pill px-3 py-1 fw-bold"
                      style="font-size:.72rem;"
                      @click="openPaymentModal">
                <i class="fa-solid fa-plus me-1"></i>Registrar pago
              </button>
            </div>
            <div class="p-4">
              <!-- Balance -->
              <div class="d-flex gap-2 mb-3">
                <div class="flex-fill text-center p-2 rounded-3 bg-body-tertiary border">
                  <div class="label-sm">Total</div>
                  <div class="fw-bold small text-body-emphasis">Bs. {{ fmtMoney(order.total_amount) }}</div>
                </div>
                <div class="flex-fill text-center p-2 rounded-3 border"
                     :style="order.amount_paid > 0 ? 'background:#f0fdf4;border-color:#bbf7d0!important;' : 'background:var(--bs-tertiary-bg);'">
                  <div class="label-sm">Pagado</div>
                  <div class="fw-bold small" :class="order.amount_paid > 0 ? 'text-success' : 'text-body-secondary'">
                    Bs. {{ fmtMoney(order.amount_paid) }}
                  </div>
                </div>
                <div class="flex-fill text-center p-2 rounded-3 border"
                     :style="order.amount_pending > 0 ? 'background:#fff7ed;border-color:#fed7aa!important;' : 'background:var(--bs-tertiary-bg);'">
                  <div class="label-sm">Pendiente</div>
                  <div class="fw-bold small" :class="order.amount_pending > 0 ? 'text-warning' : 'text-body-secondary'">
                    Bs. {{ fmtMoney(order.amount_pending) }}
                  </div>
                </div>
              </div>
              <!-- Lista de pagos -->
              <div v-if="order.payments?.length" class="d-flex flex-column gap-2">
                <div v-for="p in order.payments" :key="p.id"
                     class="d-flex align-items-center justify-content-between small">
                  <div>
                    <span class="fw-semibold text-body-emphasis">{{ METHOD_LABEL[p.payment_method] ?? p.payment_method }}</span>
                    <span class="text-muted ms-2" style="font-size:.7rem;">{{ fmtDate(p.created_at) }}</span>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <span class="fw-bold text-body-emphasis">Bs. {{ fmtMoney(p.amount) }}</span>
                    <span class="badge rounded-pill px-2 border sol-fw-800 sol-smallest"
                          :class="PMT_STATUS_CLS[p.status]">
                      {{ PMT_STATUS_LABEL[p.status] ?? p.status }}
                    </span>
                  </div>
                </div>
              </div>
              <p v-else class="text-muted small mb-0 text-center">Sin pagos registrados</p>
            </div>
          </div>

          <!-- Devoluciones -->
          <div v-if="showReturnsSection" class="info-card rounded-4 mb-4 shadow-sm overflow-hidden">
            <div class="info-card-header d-flex align-items-center justify-content-between">
              <span>Devoluciones</span>
              <button v-if="order.status === 'delivered'"
                      class="btn btn-sm btn-outline-warning rounded-pill px-3 py-1 fw-bold"
                      style="font-size:.72rem;"
                      @click="openReturnModal">
                <i class="fa-solid fa-rotate-left me-1"></i>Solicitar
              </button>
            </div>
            <div class="p-4">
              <div v-if="order.returns?.length" class="d-flex flex-column gap-2">
                <div v-for="r in order.returns" :key="r.id"
                     class="d-flex align-items-center justify-content-between small p-2 rounded-3 bg-body-tertiary border">
                  <div>
                    <span class="badge rounded-pill px-2 py-1 me-2 border sol-fw-800 sol-smallest"
                          :class="r.return_type === 'full' ? 'bg-dark text-white border-dark' : 'bg-light text-dark border'">
                      {{ r.return_type === 'full' ? 'Total' : 'Parcial' }}
                    </span>
                    <span v-if="r.product_name" class="text-body-secondary">{{ r.product_name }}</span>
                  </div>
                  <span class="badge rounded-pill px-2 border sol-fw-800 sol-smallest"
                        :class="RETURN_STATUS_CLS[r.status]">
                    {{ RETURN_STATUS_LABEL[r.status] ?? r.status }}
                  </span>
                </div>
              </div>
              <p v-else class="text-muted small mb-0 text-center">Sin devoluciones registradas</p>
            </div>
          </div>

          <!-- Historial -->
          <div v-if="order.handlers?.length" class="info-card rounded-4 shadow-sm overflow-hidden">
            <div class="info-card-header">Historial / Bitácora</div>
            <div class="p-4">
              <div class="timeline">
                <div v-for="(h, idx) in order.handlers" :key="h.id"
                     class="timeline-item" :class="{ last: idx === order.handlers.length - 1 }">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="small fw-bold text-body-emphasis">{{ h.action_taken }}</div>
                    <div class="d-flex gap-2 align-items-center mt-1 flex-wrap">
                      <span class="badge rounded-pill bg-light text-muted border sol-smallest" style="font-size:.65rem;">{{ h.handler_role }}</span>
                      <span class="text-muted smaller" style="font-size:.72rem;">{{ h.handler_name }}</span>
                    </div>
                    <div v-if="h.notes" class="text-muted fst-italic mt-2 p-2 bg-light border rounded-3 small" style="font-size:.75rem;">"{{ h.notes }}"</div>
                    <div class="text-muted mt-1" style="font-size:.68rem;">
                      <i class="fa-regular fa-clock me-1"></i>{{ fmtDateLong(h.handled_at) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ── MODAL: Confirmación de transición ──────────────────────────── -->
    <BaseModal v-model="showTransitionModal" :title="TRANSITION_CONFIG[pendingTransition]?.label ?? 'Cambiar estado'" size="md">
      <div class="p-2">
        <template v-if="pendingTransition === 'in_production'">
          <div class="p-3 rounded-3 bg-body-tertiary border mb-3">
            <p class="small mb-1 fw-bold text-body-emphasis">
              <i class="fa-solid fa-gears me-2 text-info"></i>Se crearán órdenes de producción para cada ítem del pedido.
            </p>
            <p class="smaller text-body-secondary mb-0">El pedido pasará a estado <strong>En Producción</strong>. Gestiona cada orden desde el módulo de Producción.</p>
          </div>
        </template>
        <template v-else>
          <p class="text-body-secondary small mb-3">
            ¿Confirmas el cambio de estado a <strong class="text-body-emphasis">{{ STATUS_CONFIG[pendingTransition]?.label ?? pendingTransition }}</strong>?
          </p>
        </template>
        <label class="form-label smaller fw-800 text-body-secondary text-uppercase mb-2">Notas (opcional)</label>
        <textarea v-model="transitionNotes" class="form-control sol-textarea" rows="3" placeholder="Observaciones…"></textarea>
      </div>
      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showTransitionModal = false">Cancelar</BaseButton>
          <BaseButton :variant="TRANSITION_CONFIG[pendingTransition]?.variant ?? 'brand'" class="rounded-pill px-5"
                      :loading="transitioning" @click="confirmTransition">Confirmar</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- ── MODAL: Crear envío ──────────────────────────────────────────── -->
    <BaseModal v-model="showShipmentModal" title="Crear envío" size="md">
      <template #icon><i class="fa-solid fa-truck"></i></template>
      <div class="p-2 row g-3">
        <div class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase mb-2">Número de tracking</label>
          <input v-model="shipmentForm.tracking_number" type="text" class="form-control" placeholder="Ej: TRK-001234 (opcional)">
        </div>
        <div class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase mb-2">Mensajero / empresa de transporte</label>
          <input v-model="shipmentForm.courier_name" type="text" class="form-control" placeholder="Ej: DHL, reparto propio… (opcional)">
        </div>
        <div class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase mb-2">Notas de entrega</label>
          <textarea v-model="shipmentForm.notes" class="form-control sol-textarea" rows="3" placeholder="Instrucciones especiales…"></textarea>
        </div>
        <div v-if="order?.status === 'ready'" class="col-12">
          <div class="p-3 rounded-3 bg-body-tertiary border">
            <p class="smaller text-body-secondary mb-0">
              <i class="fa-solid fa-circle-info me-1 text-info"></i>
              Al crear el envío, el pedido pasará automáticamente a <strong>Enviado</strong>.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showShipmentModal = false">Cancelar</BaseButton>
          <BaseButton variant="brand" class="rounded-pill px-5" :loading="savingShipment" @click="confirmShipment">
            Crear envío
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- ── MODAL: Registrar pago ──────────────────────────────────────── -->
    <BaseModal v-model="showPaymentModal" title="Registrar pago" size="md">
      <template #icon><i class="fa-solid fa-money-bill-wave"></i></template>
      <div class="p-2 row g-3">
        <div class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase mb-2">Método de pago *</label>
          <select v-model="paymentForm.payment_method" class="form-select" :class="{ 'is-invalid': paymentErrors.payment_method }">
            <option value="">— Seleccionar —</option>
            <option v-for="m in PAYMENT_METHODS" :key="m.key" :value="m.key">{{ m.label }}</option>
          </select>
          <div class="invalid-feedback">{{ paymentErrors.payment_method }}</div>
        </div>
        <div class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase mb-2">Monto *</label>
          <div class="input-group">
            <span class="input-group-text">Bs.</span>
            <input v-model="paymentForm.amount" type="number" step="0.01" min="0.01"
                   class="form-control" :class="{ 'is-invalid': paymentErrors.amount }"
                   placeholder="0.00">
            <div class="invalid-feedback">{{ paymentErrors.amount }}</div>
          </div>
        </div>
        <div class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase mb-2">Referencia / N° transacción</label>
          <input v-model="paymentForm.transaction_id" type="text" class="form-control" placeholder="Opcional">
        </div>
        <div class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase mb-2">Notas</label>
          <textarea v-model="paymentForm.notes" class="form-control sol-textarea" rows="2" placeholder="Opcional"></textarea>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input v-model="paymentForm.mark_completed" type="checkbox" class="form-check-input" id="mark_completed">
            <label class="form-check-label small fw-semibold" for="mark_completed">
              Marcar como pagado inmediatamente
              <span class="text-muted fw-normal">(efectivo / transferencia ya confirmada)</span>
            </label>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showPaymentModal = false">Cancelar</BaseButton>
          <BaseButton variant="brand" class="rounded-pill px-5" :loading="savingPayment" @click="confirmPayment">
            Registrar pago
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- ── MODAL: Solicitar devolución ───────────────────────────────── -->
    <BaseModal v-model="showReturnModal" title="Solicitar devolución" size="md">
      <template #icon><i class="fa-solid fa-rotate-left"></i></template>
      <div class="p-2 row g-3">
        <div class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase mb-2">Tipo de devolución *</label>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-sm flex-fill rounded-pill fw-bold"
                    :class="returnForm.return_type === 'full' ? 'btn-dark' : 'btn-outline-secondary'"
                    @click="returnForm.return_type = 'full'; returnForm.order_item_id = ''">
              Devolución total
            </button>
            <button type="button" class="btn btn-sm flex-fill rounded-pill fw-bold"
                    :class="returnForm.return_type === 'partial' ? 'btn-dark' : 'btn-outline-secondary'"
                    @click="returnForm.return_type = 'partial'">
              Devolución parcial
            </button>
          </div>
        </div>
        <div v-if="returnForm.return_type === 'partial'" class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase mb-2">Ítem afectado *</label>
          <select v-model="returnForm.order_item_id" class="form-select" :class="{ 'is-invalid': returnErrors.order_item_id }">
            <option value="">— Seleccionar producto —</option>
            <option v-for="item in order?.items" :key="item.id" :value="item.id">
              {{ item.product_name }} (x{{ item.quantity }})
            </option>
          </select>
          <div class="invalid-feedback">{{ returnErrors.order_item_id }}</div>
        </div>
        <div class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase mb-2">Motivo</label>
          <textarea v-model="returnForm.reason" class="form-control sol-textarea" rows="3"
                    placeholder="Describe el motivo de la devolución…"></textarea>
        </div>
        <div class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase mb-2">Monto a reembolsar</label>
          <div class="input-group">
            <span class="input-group-text">Bs.</span>
            <input v-model="returnForm.refund_amount" type="number" step="0.01" min="0" class="form-control" placeholder="Opcional">
          </div>
        </div>
        <div class="col-12">
          <div class="p-3 rounded-3 bg-body-tertiary border">
            <p class="smaller text-body-secondary mb-0">
              <i class="fa-solid fa-circle-info me-1 text-info"></i>
              La solicitud quedará en estado <strong>Solicitada</strong>. Ve al módulo de Devoluciones para aprobarla.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showReturnModal = false">Cancelar</BaseButton>
          <BaseButton variant="warning" class="rounded-pill px-5" :loading="savingReturn" @click="confirmReturn">
            Solicitar devolución
          </BaseButton>
        </div>
      </template>
    </BaseModal>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import api from '../plugins/axios';
import { Toast } from '../plugins/swal';
import BaseModal from '../components/base/BaseModal.vue';
import BaseButton from '../components/base/BaseButton.vue';

// ── PROPS & EMITS ─────────────────────────────────────────────────────
const props = defineProps({ orderId: { type: String, required: true } });
const emit  = defineEmits(['close', 'refresh-list']);

// ── CONSTANTES ────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:       { label: 'Pendiente',     cls: 'badge-sol-pending' },
  confirmed:     { label: 'Confirmado',    cls: 'bg-primary-subtle text-primary border-primary-subtle' },
  in_production: { label: 'En Producción', cls: 'bg-info-subtle text-info border-info-subtle' },
  ready:         { label: 'Listo',         cls: 'bg-success-subtle text-success border-success-subtle' },
  shipped:       { label: 'Enviado',       cls: 'bg-dark text-white border-dark' },
  delivered:     { label: 'Entregado',     cls: 'bg-success-subtle text-success border-success-subtle' },
  cancelled:     { label: 'Cancelado',     cls: 'bg-danger-subtle text-danger border-danger-subtle' },
  returned:      { label: 'Devuelto',      cls: 'bg-secondary-subtle text-secondary border-secondary-subtle' },
};

const TRANSITION_CONFIG = {
  confirmed:     { label: 'Confirmar pedido',   variant: 'brand',   btn: 'btn-primary',  icon: 'fa-circle-check' },
  in_production: { label: 'Iniciar producción', variant: 'brand',   btn: 'btn-info',     icon: 'fa-gears' },
  ready:         { label: 'Marcar como listo',  variant: 'brand',   btn: 'btn-success',  icon: 'fa-box-open' },
  shipped:       { label: 'Marcar enviado',     variant: 'brand',   btn: 'btn-dark',     icon: 'fa-truck' },
  delivered:     { label: 'Confirmar entrega',  variant: 'brand',   btn: 'btn-success',  icon: 'fa-check-double' },
  cancelled:     { label: 'Cancelar pedido',    variant: 'danger',  btn: 'btn-danger',   icon: 'fa-ban' },
  returned:      { label: 'Registrar dev.',     variant: 'warning', btn: 'btn-warning',  icon: 'fa-rotate-left' },
};

const PROD_STATUS_CONFIG = {
  queued:      { label: 'En cola',     cls: 'bg-warning-subtle text-warning border-warning-subtle', icon: 'fa-clock' },
  in_progress: { label: 'Produciendo', cls: 'bg-info-subtle text-info border-info-subtle',          icon: 'fa-gears' },
  completed:   { label: 'Producido',   cls: 'bg-success-subtle text-success border-success-subtle', icon: 'fa-check' },
};

const SHIPMENT_STATUS_CONFIG = {
  preparing:  { label: 'Preparando',  cls: 'bg-warning-subtle text-warning border-warning-subtle' },
  shipped:    { label: 'Despachado',  cls: 'bg-dark text-white border-dark' },
  in_transit: { label: 'En Tránsito', cls: 'bg-info-subtle text-info border-info-subtle' },
  delivered:  { label: 'Entregado',   cls: 'bg-success-subtle text-success border-success-subtle' },
  failed:     { label: 'Fallido',     cls: 'bg-danger-subtle text-danger border-danger-subtle' },
};

const PAYMENT_METHODS = [
  { key: 'efectivo',               label: 'Efectivo / Contraentrega' },
  { key: 'transferencia_bancaria', label: 'Transferencia bancaria' },
  { key: 'tarjeta_debito',         label: 'Tarjeta débito' },
  { key: 'tarjeta_credito',        label: 'Tarjeta crédito' },
  { key: 'cheque',                 label: 'Cheque' },
  { key: 'mercadopago',            label: 'MercadoPago' },
  { key: 'otro',                   label: 'Otro' },
];
const METHOD_LABEL = Object.fromEntries(PAYMENT_METHODS.map(m => [m.key, m.label]));

const PMT_STATUS_LABEL = { pending: 'Pendiente', completed: 'Pagado', failed: 'Fallido', refunded: 'Reembolsado' };
const PMT_STATUS_CLS   = {
  pending:   'bg-warning-subtle text-warning border-warning-subtle',
  completed: 'bg-success-subtle text-success border-success-subtle',
  failed:    'bg-danger-subtle text-danger border-danger-subtle',
  refunded:  'bg-secondary-subtle text-secondary border-secondary-subtle',
};

const RETURN_STATUS_LABEL = { requested: 'Solicitada', approved: 'Aprobada', rejected: 'Rechazada', resolved: 'Resuelta' };
const RETURN_STATUS_CLS   = {
  requested: 'bg-warning-subtle text-warning border-warning-subtle',
  approved:  'bg-info-subtle text-info border-info-subtle',
  rejected:  'bg-danger-subtle text-danger border-danger-subtle',
  resolved:  'bg-success-subtle text-success border-success-subtle',
};

// ── ESTADO ────────────────────────────────────────────────────────────
const order   = ref(null);
const loading = ref(false);

// Transiciones
const showTransitionModal = ref(false);
const pendingTransition   = ref('');
const transitionNotes     = ref('');
const transitioning       = ref(false);

// Producción por ítem
const producingItemId = ref(null);

// Envío
const showShipmentModal = ref(false);
const shipmentForm      = reactive({ tracking_number: '', courier_name: '', notes: '' });
const savingShipment    = ref(false);

// Pago
const showPaymentModal = ref(false);
const paymentForm      = reactive({ payment_method: '', amount: '', transaction_id: '', notes: '', mark_completed: true });
const paymentErrors    = reactive({ payment_method: '', amount: '' });
const savingPayment    = ref(false);

// Devolución
const showReturnModal = ref(false);
const returnForm      = reactive({ return_type: 'full', order_item_id: '', reason: '', refund_amount: '' });
const returnErrors    = reactive({ order_item_id: '' });
const savingReturn    = ref(false);

// ── COMPUTADOS ────────────────────────────────────────────────────────
const visibleTransitions = computed(() => {
  if (!order.value?.allowed_transitions) return [];
  // 'returned' se intercepta al modal de devolución; lo mantenemos visible
  return order.value.allowed_transitions;
});

const showProductionCol = computed(() =>
  order.value && ['pending', 'confirmed', 'in_production'].includes(order.value.status)
);

const canCreateShipment = computed(() =>
  order.value && ['ready', 'shipped'].includes(order.value.status)
);

const canRegisterPayment = computed(() =>
  order.value &&
  !['cancelled', 'returned'].includes(order.value.status) &&
  (order.value.amount_pending ?? 0) > 0
);

const showReturnsSection = computed(() =>
  order.value && (['delivered', 'returned'].includes(order.value.status) || order.value.returns?.length > 0)
);

const needsProductionAttention = computed(() => {
  if (!order.value || order.value.status !== 'in_production') return false;
  return order.value.items?.some(i => i.production_status === 'none' && i.stock && i.stock.available < i.quantity) ?? false;
});

// ── CARGA DE DATOS ───────────────────────────────────────────────────
async function loadOrder() {
  loading.value = true;
  try {
    const { data } = await api.get(`/orders/${props.orderId}`);
    order.value = data.data ?? data;
  } catch {
    Toast.fire({ icon: 'error', title: 'Error al cargar el pedido' });
    emit('close');
  } finally {
    loading.value = false;
  }
}

watch(() => props.orderId, loadOrder, { immediate: true });

// ── TRANSICIONES DE ESTADO ───────────────────────────────────────────
function initiateTransition(status) {
  if (status === 'returned') {
    openReturnModal();
    return;
  }
  pendingTransition.value   = status;
  transitionNotes.value     = '';
  showTransitionModal.value = true;
}

async function confirmTransition() {
  transitioning.value = true;
  try {
    if (pendingTransition.value === 'in_production') {
      await api.post(`/orders/${order.value.id}/production-orders`, {
        internal_notes: transitionNotes.value || null,
      });
    } else {
      await api.patch(`/orders/${order.value.id}/status`, {
        status: pendingTransition.value,
        notes:  transitionNotes.value || null,
      });
    }
    showTransitionModal.value = false;
    Toast.fire({ icon: 'success', title: 'Estado actualizado correctamente' });
    await loadOrder();
    emit('refresh-list');
  } catch (e) {
    Toast.fire({ icon: 'error', title: e.response?.data?.message ?? 'Error al cambiar el estado.' });
  } finally {
    transitioning.value = false;
  }
}

// ── PRODUCCIÓN POR ÍTEM ──────────────────────────────────────────────
async function produceItem(item) {
  producingItemId.value = item.id;
  try {
    await api.post(`/orders/${order.value.id}/production-orders`, { order_item_id: item.id });
    Toast.fire({ icon: 'success', title: `Producción creada para "${item.product_name}"` });
    await loadOrder();
    emit('refresh-list');
  } catch (e) {
    Toast.fire({ icon: 'error', title: e.response?.data?.message ?? 'Error al crear la producción.' });
  } finally {
    producingItemId.value = null;
  }
}

// ── CREAR ENVÍO ───────────────────────────────────────────────────────
function openShipmentModal() {
  Object.assign(shipmentForm, { tracking_number: '', courier_name: '', notes: '' });
  showShipmentModal.value = true;
}

async function confirmShipment() {
  savingShipment.value = true;
  try {
    await api.post(`/orders/${order.value.id}/shipments`, {
      tracking_number: shipmentForm.tracking_number || null,
      courier_name:    shipmentForm.courier_name    || null,
      notes:           shipmentForm.notes           || null,
    });
    showShipmentModal.value = false;
    Toast.fire({ icon: 'success', title: 'Envío creado correctamente' });
    await loadOrder();
    emit('refresh-list');
  } catch (e) {
    Toast.fire({ icon: 'error', title: e.response?.data?.message ?? 'Error al crear el envío.' });
  } finally {
    savingShipment.value = false;
  }
}

// ── REGISTRAR PAGO ────────────────────────────────────────────────────
function openPaymentModal() {
  Object.assign(paymentForm, {
    payment_method: '',
    amount:         order.value?.amount_pending ?? '',
    transaction_id: '',
    notes:          '',
    mark_completed: true,
  });
  Object.assign(paymentErrors, { payment_method: '', amount: '' });
  showPaymentModal.value = true;
}

async function confirmPayment() {
  Object.assign(paymentErrors, { payment_method: '', amount: '' });
  if (!paymentForm.payment_method) { paymentErrors.payment_method = 'El método de pago es obligatorio.'; return; }
  if (!paymentForm.amount || paymentForm.amount <= 0) { paymentErrors.amount = 'El monto debe ser mayor a cero.'; return; }

  savingPayment.value = true;
  try {
    await api.post(`/orders/${order.value.id}/payments`, {
      payment_method:  paymentForm.payment_method,
      amount:          parseFloat(paymentForm.amount),
      transaction_id:  paymentForm.transaction_id || null,
      notes:           paymentForm.notes          || null,
      mark_completed:  paymentForm.mark_completed,
    });
    showPaymentModal.value = false;
    Toast.fire({ icon: 'success', title: 'Pago registrado correctamente' });
    await loadOrder();
    emit('refresh-list');
  } catch (e) {
    const errs = e.response?.data?.errors ?? {};
    if (errs.payment_method) paymentErrors.payment_method = errs.payment_method[0];
    if (errs.amount)         paymentErrors.amount         = errs.amount[0];
    if (!errs.payment_method && !errs.amount) {
      Toast.fire({ icon: 'error', title: e.response?.data?.message ?? 'Error al registrar el pago.' });
    }
  } finally {
    savingPayment.value = false;
  }
}

// ── SOLICITAR DEVOLUCIÓN ──────────────────────────────────────────────
function openReturnModal() {
  Object.assign(returnForm, { return_type: 'full', order_item_id: '', reason: '', refund_amount: '' });
  Object.assign(returnErrors, { order_item_id: '' });
  showReturnModal.value = true;
}

async function confirmReturn() {
  Object.assign(returnErrors, { order_item_id: '' });
  if (returnForm.return_type === 'partial' && !returnForm.order_item_id) {
    returnErrors.order_item_id = 'Debes seleccionar el ítem para una devolución parcial.';
    return;
  }
  savingReturn.value = true;
  try {
    await api.post(`/orders/${order.value.id}/returns`, {
      return_type:    returnForm.return_type,
      order_item_id:  returnForm.return_type === 'partial' ? returnForm.order_item_id : undefined,
      reason:         returnForm.reason       || null,
      refund_amount:  returnForm.refund_amount ? parseFloat(returnForm.refund_amount) : undefined,
    });
    showReturnModal.value = false;
    Toast.fire({ icon: 'success', title: 'Solicitud de devolución registrada. Gestiona la aprobación en Devoluciones.' });
    await loadOrder();
    emit('refresh-list');
  } catch (e) {
    const errs = e.response?.data?.errors ?? {};
    if (errs.order_item_id) returnErrors.order_item_id = errs.order_item_id[0];
    if (!errs.order_item_id) {
      Toast.fire({ icon: 'error', title: e.response?.data?.message ?? 'Error al solicitar la devolución.' });
    }
  } finally {
    savingReturn.value = false;
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────
function customerName(c) {
  if (!c) return '—';
  return c.business_name || c.name || '—';
}
function fmtMoney(v) {
  return Number(v ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDateLong(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function fmtDateOnly(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
}
</script>

<style scoped>
.btn-back-circle {
  width: 40px; height: 40px;
  background: var(--bg-card); border: 1px solid var(--border-color);
  color: var(--text-muted); transition: all .2s ease;
}
.btn-back-circle:hover { color: var(--color-primary); background: var(--bg-hover); transform: translateX(-4px); }

.info-card {
  background: var(--bg-card); border: 1px solid var(--border-color);
  transition: box-shadow .25s ease;
}
.info-card:hover { box-shadow: var(--shadow-md); }
.info-card-header {
  background: var(--bs-tertiary-bg); border-bottom: 1px solid var(--bs-border-color);
  padding: .8rem 1.25rem; font-size: .78rem; font-weight: 700;
  color: var(--bs-body-color); text-transform: uppercase; letter-spacing: .06em;
}
.label-sm { font-size: .68rem; text-transform: uppercase; letter-spacing: .05em; color: var(--bs-secondary-color); font-weight: 700; margin-bottom: 4px; }
.value-sm  { font-size: .88rem; color: var(--bs-body-color); font-weight: 500; }

.timeline { position: relative; padding-left: 1.25rem; }
.timeline-item { position: relative; padding-bottom: 1.5rem; padding-left: 1.25rem; }
.timeline-item:not(.last)::before { content: ''; position: absolute; left: 0; top: 10px; bottom: 0; width: 1.5px; background: var(--border-color); }
.timeline-dot { position: absolute; left: -4px; top: 5px; width: 10px; height: 10px; border-radius: 50%; background: var(--color-primary); border: 2px solid var(--bg-card); }
.timeline-content { padding-left: .25rem; }

.stock-dot   { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
.stock-label { font-size: .67rem; text-transform: uppercase; letter-spacing: .04em; color: var(--bs-secondary-color); font-weight: 600; }
.stock-value { font-size: .72rem; font-weight: 700; }

.btn-prod {
  font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; white-space: nowrap;
  border: 1px solid var(--bs-info-border-subtle, #9eeaf9);
  color: var(--bs-info, #0dcaf0); background: var(--bs-info-bg-subtle, #cff4fc);
  transition: all .2s ease;
}
.btn-prod:hover:not(:disabled) { background: var(--bs-info, #0dcaf0); color: #fff; }
.btn-prod:disabled { opacity: .55; cursor: default; }

.badge-sol-pending {
  background-color: #fffbeb !important; color: #78350f !important; border: 1px solid #fde68a !important;
}
[data-theme="dark"] .badge-sol-pending, [data-theme="semidark"] .badge-sol-pending {
  background-color: rgba(217,119,6,.15) !important; color: #fbbf24 !important; border-color: rgba(217,119,6,.3) !important;
}
</style>
