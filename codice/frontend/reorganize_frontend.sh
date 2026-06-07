#!/usr/bin/env bash
# ============================================================
# LogiChain Frontend — Riorganizzazione struttura
# Esegui dalla ROOT del progetto frontend (dove c'è package.json)
# ============================================================
set -e

echo "▶ Creazione struttura target..."

# ── Nuove cartelle ───────────────────────────────────────────
mkdir -p src/components/layout
mkdir -p src/components/shared
mkdir -p src/modules/anagrafiche/components
mkdir -p src/modules/magazzino/components
mkdir -p src/modules/acquisti/components
mkdir -p src/modules/vendite/components
mkdir -p src/modules/logistica/components
mkdir -p src/modules/amministrazione/components

echo "✔ Cartelle create"

# ════════════════════════════════════════════════════════════
# 1. LAYOUT — Sidebar, Header e dipendenze
# ════════════════════════════════════════════════════════════
echo "▶ Sposto componenti layout..."

mv src/app/components/Sidebar.tsx             src/components/layout/Sidebar.tsx
mv src/app/components/Header.tsx              src/components/layout/Header.tsx
mv src/app/components/GlobalSearch.tsx        src/components/layout/GlobalSearch.tsx
mv src/app/components/NotificationsPanel.tsx  src/components/layout/NotificationsPanel.tsx

# NavBar e PrivateRoute erano già in src/components/ (tuoi, M01)
# li spostiamo in layout per coerenza
mv src/components/NavBar.tsx       src/components/layout/NavBar.tsx
mv src/components/PrivateRoute.tsx src/components/layout/PrivateRoute.tsx

echo "✔ Layout: Sidebar, Header, GlobalSearch, NotificationsPanel, NavBar, PrivateRoute"

# ════════════════════════════════════════════════════════════
# 2. SHARED — Componenti dashboard condivisi
# ════════════════════════════════════════════════════════════
echo "▶ Sposto componenti shared..."

mv src/app/components/KPICard.tsx              src/components/shared/KPICard.tsx
mv src/app/components/ActivityTable.tsx        src/components/shared/ActivityTable.tsx
mv src/app/components/WarehouseCapacity.tsx    src/components/shared/WarehouseCapacity.tsx
mv src/app/components/CriticalProductsAlert.tsx src/components/shared/CriticalProductsAlert.tsx
mv src/app/components/MiniCalendar.tsx         src/components/shared/MiniCalendar.tsx
mv src/app/components/OrdersBarChart.tsx       src/components/shared/OrdersBarChart.tsx
mv src/app/components/OrdersPieChart.tsx       src/components/shared/OrdersPieChart.tsx

echo "✔ Shared: KPICard, ActivityTable, WarehouseCapacity, CriticalProductsAlert, MiniCalendar, Charts"

# ════════════════════════════════════════════════════════════
# 3. UI — Sposta shadcn e PageTabBar (già in ui/, resta ui/)
#    Solo la cartella cambia parent: app/components/ui → components/ui
# ════════════════════════════════════════════════════════════
echo "▶ Sposto ui/ (shadcn + PageTabBar)..."

mv src/app/components/ui src/components/ui

echo "✔ ui/ spostata in src/components/ui/"

# ════════════════════════════════════════════════════════════
# 4. MODULES — Page components + loro sub-components
# ════════════════════════════════════════════════════════════
echo "▶ Sposto modulo anagrafiche..."
mv src/app/components/AnagrafichePage.tsx          src/modules/anagrafiche/AnagrafichePage.tsx
mv src/app/components/anagrafiche/ProductFormModal.tsx   src/modules/anagrafiche/components/ProductFormModal.tsx
mv src/app/components/anagrafiche/CategoryFormModal.tsx  src/modules/anagrafiche/components/CategoryFormModal.tsx
mv src/app/components/anagrafiche/SupplierFormModal.tsx  src/modules/anagrafiche/components/SupplierFormModal.tsx
mv src/app/components/anagrafiche/ClientFormModal.tsx    src/modules/anagrafiche/components/ClientFormModal.tsx
mv src/app/components/anagrafiche/CourierFormModal.tsx   src/modules/anagrafiche/components/CourierFormModal.tsx

echo "▶ Sposto modulo magazzino..."
mv src/app/components/WarehousePage.tsx               src/modules/magazzino/WarehousePage.tsx
mv src/app/components/warehouse/WarehouseKPIs.tsx     src/modules/magazzino/components/WarehouseKPIs.tsx
mv src/app/components/warehouse/WarehouseTreeView.tsx src/modules/magazzino/components/WarehouseTreeView.tsx
mv src/app/components/warehouse/WarehouseWidgets.tsx  src/modules/magazzino/components/WarehouseWidgets.tsx
mv src/app/components/warehouse/StockTable.tsx        src/modules/magazzino/components/StockTable.tsx
mv src/app/components/warehouse/StockMovementsTimeline.tsx src/modules/magazzino/components/StockMovementsTimeline.tsx
mv src/app/components/warehouse/NewMovementModal.tsx  src/modules/magazzino/components/NewMovementModal.tsx

echo "▶ Sposto modulo acquisti..."
mv src/app/components/PurchasesPage.tsx                    src/modules/acquisti/PurchasesPage.tsx
mv src/app/components/purchases/PurchaseKPIs.tsx           src/modules/acquisti/components/PurchaseKPIs.tsx
mv src/app/components/purchases/PurchaseOrdersTable.tsx    src/modules/acquisti/components/PurchaseOrdersTable.tsx
mv src/app/components/purchases/PurchaseWidgets.tsx        src/modules/acquisti/components/PurchaseWidgets.tsx
mv src/app/components/purchases/GoodsReceiptsTimeline.tsx  src/modules/acquisti/components/GoodsReceiptsTimeline.tsx
mv src/app/components/purchases/SuppliersPerformance.tsx   src/modules/acquisti/components/SuppliersPerformance.tsx
mv src/app/components/purchases/OrderDetailDrawer.tsx      src/modules/acquisti/components/OrderDetailDrawer.tsx
mv src/app/components/purchases/NewPurchaseOrderModal.tsx  src/modules/acquisti/components/NewPurchaseOrderModal.tsx

echo "▶ Sposto modulo vendite..."
mv src/app/components/SalesPage.tsx                   src/modules/vendite/SalesPage.tsx
mv src/app/components/sales/SalesKPIs.tsx             src/modules/vendite/components/SalesKPIs.tsx
mv src/app/components/sales/SalesOrdersTable.tsx      src/modules/vendite/components/SalesOrdersTable.tsx
mv src/app/components/sales/SalesWidgets.tsx          src/modules/vendite/components/SalesWidgets.tsx
mv src/app/components/sales/SalesChart.tsx            src/modules/vendite/components/SalesChart.tsx
mv src/app/components/sales/TopClienti.tsx            src/modules/vendite/components/TopClienti.tsx
mv src/app/components/sales/SalesOrderDrawer.tsx      src/modules/vendite/components/SalesOrderDrawer.tsx
mv src/app/components/sales/NewSalesOrderModal.tsx    src/modules/vendite/components/NewSalesOrderModal.tsx
mv src/app/components/sales/SalesRecentActivity.tsx   src/modules/vendite/components/SalesRecentActivity.tsx
mv src/app/components/sales/SalesShipments.tsx        src/modules/vendite/components/SalesShipments.tsx

echo "▶ Sposto modulo logistica..."
mv src/app/components/LogisticsPage.tsx                    src/modules/logistica/LogisticsPage.tsx
mv src/app/components/logistics/LogisticsKPIs.tsx          src/modules/logistica/components/LogisticsKPIs.tsx
mv src/app/components/logistics/ShipmentsTable.tsx         src/modules/logistica/components/ShipmentsTable.tsx
mv src/app/components/logistics/LogisticsWidgets.tsx       src/modules/logistica/components/LogisticsWidgets.tsx
mv src/app/components/logistics/CourierPerformance.tsx     src/modules/logistica/components/CourierPerformance.tsx
mv src/app/components/logistics/AdvancedKPIs.tsx           src/modules/logistica/components/AdvancedKPIs.tsx
mv src/app/components/logistics/ShipmentDrawer.tsx         src/modules/logistica/components/ShipmentDrawer.tsx
mv src/app/components/logistics/NewShipmentModal.tsx       src/modules/logistica/components/NewShipmentModal.tsx
mv src/app/components/logistics/LogisticsTimeline.tsx      src/modules/logistica/components/LogisticsTimeline.tsx
mv src/app/components/logistics/ScheduledDeliveries.tsx    src/modules/logistica/components/ScheduledDeliveries.tsx
mv src/app/components/logistics/DeliveryMap.tsx            src/modules/logistica/components/DeliveryMap.tsx

echo "▶ Sposto modulo amministrazione..."
mv src/app/components/AdministrationPage.tsx                        src/modules/amministrazione/AdministrationPage.tsx
mv src/app/components/administration/AdminKPIs.tsx                  src/modules/amministrazione/components/AdminKPIs.tsx
mv src/app/components/administration/CashFlowChart.tsx              src/modules/amministrazione/components/CashFlowChart.tsx
mv src/app/components/administration/CriticalPartners.tsx           src/modules/amministrazione/components/CriticalPartners.tsx
mv src/app/components/administration/EconomicAnalysis.tsx           src/modules/amministrazione/components/EconomicAnalysis.tsx
mv src/app/components/administration/FinancialWidgets.tsx           src/modules/amministrazione/components/FinancialWidgets.tsx
mv src/app/components/administration/InvoiceDrawer.tsx              src/modules/amministrazione/components/InvoiceDrawer.tsx
mv src/app/components/administration/InvoicesTable.tsx              src/modules/amministrazione/components/InvoicesTable.tsx
mv src/app/components/administration/NewInvoiceModal.tsx            src/modules/amministrazione/components/NewInvoiceModal.tsx
mv src/app/components/administration/PaymentSchedule.tsx            src/modules/amministrazione/components/PaymentSchedule.tsx
mv src/app/components/administration/RecentActivities.tsx           src/modules/amministrazione/components/RecentActivities.tsx
mv src/app/components/administration/RecentPayments.tsx             src/modules/amministrazione/components/RecentPayments.tsx

echo "✔ Tutti i moduli spostati"

# ════════════════════════════════════════════════════════════
# 5. App.tsx — spostato da src/app/ a src/
# ════════════════════════════════════════════════════════════
echo "▶ Sposto App.tsx in src/..."
mv src/app/App.tsx src/App.tsx

echo "✔ App.tsx → src/App.tsx"

# ════════════════════════════════════════════════════════════
# 6. PULIZIA — file Figma inutili
# ════════════════════════════════════════════════════════════
echo "▶ Rimozione file Figma..."

rm -rf src/imports/
rm -f  src/app/components/AnagrafichePage.tsx.backup
rm -f  src/index.css
rm -f  default_shadcn_theme.css
rm -f  ATTRIBUTIONS.md
rm -rf guidelines/
rm -rf src/app/components/figma/

# File Figma opzionali ora residui — cartelle vuote
# CollaboratoriPage, UserProfilePage, CompanyPage: non usate in App.tsx
# le teniamo per ora in src/app/components/ — decidi tu se eliminare
echo "⚠  Rimasti in src/app/components/ (non referenziati in App.tsx, valuta tu):"
echo "   - CollaboratoriPage.tsx"
echo "   - UserProfilePage.tsx"
echo "   - CompanyPage.tsx"

# ════════════════════════════════════════════════════════════
# 7. Pulizia cartelle vuote src/app/
# ════════════════════════════════════════════════════════════
echo "▶ Pulizia cartelle vuote..."
# Rimuovi le sub-cartelle svuotate dentro app/components
rmdir --ignore-fail-on-non-empty \
  src/app/components/anagrafiche \
  src/app/components/warehouse \
  src/app/components/purchases \
  src/app/components/sales \
  src/app/components/logistics \
  src/app/components/administration \
  2>/dev/null || true

echo "✔ Pulizia completata"

# ════════════════════════════════════════════════════════════
# RIEPILOGO struttura finale
# ════════════════════════════════════════════════════════════
echo ""
echo "════════════════════════════════════════"
echo "  Struttura src/ dopo la riorganizzazione"
echo "════════════════════════════════════════"
find src -type f -name "*.tsx" -o -name "*.ts" | sort | grep -v node_modules
