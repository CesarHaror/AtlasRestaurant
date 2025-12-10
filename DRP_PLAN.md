# AtlasERP - Plan de Recuperación ante Desastres (DRP)

**Versión**: 1.0  
**Fecha**: Diciembre 2025  
**Estado**: Crítico - Proteger en múltiples ubicaciones

---

## 📋 Tabla de Contenidos

1. [Estrategia de Backup](#estrategia-de-backup)
2. [Escenarios de Recuperación](#escenarios-de-recuperación)
3. [Procedimientos de Recuperación](#procedimientos-de-recuperación)
4. [Verificación Post-Recuperación](#verificación-post-recuperación)
5. [Mantenimiento del Plan DRP](#mantenimiento-del-plan-drp)

---

## 💾 Estrategia de Backup

### Niveles de Backup

#### **Nivel 1: Backup Local Diario** (Alta Frecuencia)
```bash
# Ejecutar cada 2 horas
0 */2 * * * /opt/AtlasERP/scripts/backup-atlas.sh

# O diariamente a las 2 AM
0 2 * * * /opt/AtlasERP/scripts/backup-atlas.sh >> /var/log/atlaserc-backup.log 2>&1
```

**Ubicación**: `/backups/atlaserc/`  
**Contenido**:
- `db_backup_YYYYMMDD_HHMMSS.sql.gz` (BD completa)
- `project_backup_YYYYMMDD_HHMMSS.tar.gz` (Código + config)

**Retención**: 30 días

#### **Nivel 2: Backup Semanal Externo** (Seguridad Crítica)
```bash
# Cada domingo a las 3 AM
0 3 * * 0 /opt/AtlasERP/scripts/backup-external.sh
```

**Ubicación**: Externa (USB, NAS, Cloud)  
**Formato**: Comprimido + Encriptado

#### **Nivel 3: Backup Mensual Archivado** (Histórico)
```bash
# Primer día del mes a las 4 AM
0 4 1 * * /opt/AtlasERP/scripts/backup-monthly-archive.sh
```

**Ubicación**: Almacenamiento a largo plazo  
**Retención**: 12 meses

### Checklist de Backup

```
✓ BD backing up correctly
✓ Archivos de proyecto backing up
✓ Permisos de archivos backup correctos
✓ Espacio de disco suficiente
✓ Scripts de backup ejecutándose
✓ Logs de backup monitoreados
✓ Backups externos siendo transferidos
✓ Verificación de integridad de backups
```

---

## 🚨 Escenarios de Recuperación

### Escenario 1: Corrupción Parcial de BD (CRÍTICO - < 1 hora)

**Síntomas**:
- Errores de integridad de constraint
- Queries fallando con errores de DB
- Algunos registros inaccesibles

**Severidad**: CRÍTICO  
**RTO** (Recovery Time Objective): 30 minutos  
**RPO** (Recovery Point Objective): < 1 hora

**Procedimiento**:
```bash
# 1. Detener Backend
systemctl stop atlaserc-backend

# 2. Identificar backup más reciente bueno
ls -lt /backups/atlaserc/db_backup_*.sql.gz | head -5

# 3. Restaurar BD
gunzip < /backups/atlaserc/db_backup_YYYYMMDD_HHMMSS.sql.gz | \
  psql -U atlas_user -d erp_carniceria

# 4. Reiniciar Backend
systemctl start atlaserc-backend

# 5. Verificar
psql -U atlas_user -d erp_carniceria -c "SELECT COUNT(*) FROM users;"
curl http://localhost:3000/api/health
```

### Escenario 2: Fallo Total del Servidor (CRÍTICO - < 4 horas)

**Síntomas**:
- Servidor no arranca
- SO corrupto
- Hardware fallido

**Severidad**: CRÍTICO  
**RTO**: 4 horas  
**RPO**: < 2 horas

**Procedimiento**:
```bash
# 1. En nuevo servidor/VM
sudo bash /path/to/setup-atlaserc.sh

# 2. El script descargará e instalará todo automáticamente

# 3. Restaurar última BD
gunzip < /backups/atlaserc/db_backup_LATEST.sql.gz | \
  psql -U atlas_user -d erp_carniceria

# 4. Restaurar configuración .env si es diferente
cp /backups/atlaserc/.env.backup /opt/AtlasERP/backend/.env

# 5. Reiniciar servicios
systemctl restart atlaserc-backend
systemctl restart nginx
```

### Escenario 3: Ataque/Ransomware (CRÍTICO - < 6 horas)

**Síntomas**:
- Archivos encriptados
- Cambios no autorizados
- Comportamiento anormal del sistema

**Severidad**: CRÍTICO  
**RTO**: 6 horas  
**RPO**: < 4 horas

**Procedimiento**:
```bash
# 1. Aislar el servidor
# - Desconectar del network
# - No realizar más backups

# 2. En servidor limpio/nuevo
sudo bash /opt/backup_location/setup-atlaserc.sh

# 3. Restaurar BD limpia ANTERIOR al ataque
gunzip < /backups/atlaserc/db_backup_DATE_BEFORE_ATTACK.sql.gz | \
  psql -U atlas_user -d erp_carniceria

# 4. Cambiar todas las contraseñas
# - Usuario atlas_user BD
# - JWT_SECRET
# - Admin credentials
# - API keys

# 5. Auditar y verificar integridad
psql -u atlas_user -d erp_carniceria << 'EOF'
-- Verificar cambios sospechosos recientes
SELECT * FROM users WHERE created_at > '2024-12-10 12:00:00';
SELECT * FROM products WHERE updated_at > '2024-12-10 12:00:00';
EOF

# 6. Restaurar en modo restringido
# - Sin acceso público
# - Verificación manual
```

### Escenario 4: Pérdida de Datos Críticos (ALTO - < 2 horas)

**Síntomas**:
- Registros importantes borrados
- Datos inconsistentes
- Cambios no autorizados

**Severidad**: ALTO  
**RTO**: 2 horas  
**RPO**: < 1 hora

**Procedimiento**:
```bash
# 1. Hacer backup del estado actual (para auditoría)
pg_dump -U atlas_user erp_carniceria > /tmp/state_before_recovery.sql

# 2. Restaurar punto en tiempo específico
gunzip < /backups/atlaserc/db_backup_SPECIFIC_DATE.sql.gz | \
  psql -U atlas_user -d erp_carniceria

# 3. Comparar cambios
diff /tmp/state_before_recovery.sql \
     /tmp/state_after_recovery.sql > /tmp/changes.diff

# 4. Verificar datos restaurados
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM inventory_movements;

# 5. Reiniciar aplicación
systemctl restart atlaserc-backend
```

### Escenario 5: Fallo de Aplicación (MEDIANO - < 30 minutos)

**Síntomas**:
- Backend no responde
- Errores en logs
- API retorna 500

**Severidad**: MEDIANO  
**RTO**: 30 minutos  
**RPO**: 0 (sin pérdida)

**Procedimiento**:
```bash
# 1. Revisar logs
tail -f /var/log/atlaserc-backend.log

# 2. Revisar estado del servicio
systemctl status atlaserc-backend

# 3. Si es error de memoria/recursos
free -h
df -h
ps aux | sort -k3,3nr | head -5

# 4. Limpiar e reiniciar
cd /opt/AtlasERP/backend
rm -rf dist/
npm run build
systemctl restart atlaserc-backend

# 5. Verificar BD está sana
psql -U atlas_user -d erp_carniceria -c "VACUUM ANALYZE;"
```

---

## 📋 Procedimientos de Recuperación

### Recuperación Manual de BD

```bash
# Paso 1: Conectar como super usuario
sudo -u postgres psql

# Paso 2: Dropear BD corrupta (¡CUIDADO!)
DROP DATABASE erp_carniceria;

# Paso 3: Crear BD nueva
CREATE DATABASE erp_carniceria OWNER atlas_user;

# Paso 4: Restaurar desde backup
\q  # Salir de psql

# Paso 5: Restaurar datos
gunzip < /backups/atlaserc/db_backup_YYYYMMDD_HHMMSS.sql.gz | \
  psql -U atlas_user -d erp_carniceria

# Paso 6: Verificar integridad
psql -U atlas_user -d erp_carniceria << 'EOF'
SELECT * FROM pg_tables WHERE schemaname='public';
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS total_movements FROM inventory_movements;
EOF
```

### Recuperación de Archivos

```bash
# Listar backups disponibles
ls -lah /backups/atlaserc/project_backup_*.tar.gz

# Extraer backup específico en ubicación temporal
tar -xzf /backups/atlaserc/project_backup_YYYYMMDD_HHMMSS.tar.gz -C /tmp

# Comparar archivos
diff -r /tmp/AtlasERP /opt/AtlasERP

# Restaurar archivo específico
tar -xzf /backups/atlaserc/project_backup_YYYYMMDD_HHMMSS.tar.gz \
    -C / opt --strip-components=1 AtlasERP/backend/.env
```

### Restauración Completa desde Cero

```bash
#!/bin/bash
# restore-complete.sh

echo "=== Recuperación Completa de AtlasERP ==="

BACKUP_DIR="/backups/atlaserc"
BACKUP_FILE="$BACKUP_DIR/project_backup_$(date +%Y%m%d).sql.gz"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: No se encontró backup"
    exit 1
fi

echo "1. Parando servicios..."
systemctl stop atlaserc-backend
systemctl stop nginx

echo "2. Removiendo instalación anterior..."
rm -rf /opt/AtlasERP
mkdir -p /opt/AtlasERP

echo "3. Restaurando archivos..."
tar -xzf "$BACKUP_FILE" -C /opt

echo "4. Restaurando BD..."
sudo -u postgres psql << 'EOF'
DROP DATABASE IF EXISTS erp_carniceria;
CREATE DATABASE erp_carniceria OWNER atlas_user;
EOF

gunzip < "$BACKUP_DIR/db_backup_LATEST.sql.gz" | \
  psql -U atlas_user -d erp_carniceria

echo "5. Estableciendo permisos..."
chown -R atlas_user:atlas_user /opt/AtlasERP

echo "6. Iniciando servicios..."
systemctl start atlaserc-backend
systemctl start nginx

echo "7. Verificando..."
sleep 5
curl http://localhost:3000/api/health

echo "✓ Recuperación completada"
```

---

## ✅ Verificación Post-Recuperación

### Checklist de Verificación

```bash
#!/bin/bash
# verify-recovery.sh

echo "=== Verificación de Recuperación ==="

# 1. BD
echo "Verificando BD..."
psql -U atlas_user -d erp_carniceria -c "SELECT version();" || exit 1

# 2. Tablas críticas
echo "Contando registros..."
echo "Usuarios: $(psql -U atlas_user -d erp_carniceria -tc "SELECT COUNT(*) FROM users;")"
echo "Productos: $(psql -U atlas_user -d erp_carniceria -tc "SELECT COUNT(*) FROM products;")"
echo "Movimientos: $(psql -U atlas_user -d erp_carniceria -tc "SELECT COUNT(*) FROM inventory_movements;")"

# 3. Backend
echo "Verificando Backend..."
curl -s http://localhost:3000/api/health | grep -q "running" && echo "✓ Backend OK" || echo "✗ Backend ERROR"

# 4. Archivos críticos
echo "Verificando archivos..."
[ -f /opt/AtlasERP/backend/.env ] && echo "✓ .env Backend OK" || echo "✗ .env Backend MISSING"
[ -d /opt/AtlasERP/frontend/dist ] && echo "✓ Frontend compilado OK" || echo "✗ Frontend MISSING"
[ -d /opt/AtlasERP/pos/dist ] && echo "✓ POS compilado OK" || echo "✗ POS MISSING"

# 5. Logs
echo "Últimas líneas de logs..."
tail -3 /var/log/atlaserc-backend.log

echo "✓ Verificación completada"
```

### Tests de Funcionalidad Crítica

```bash
# Test 1: Login
echo "Test de autenticación..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  -s | grep -q "access_token" && echo "✓ Login OK" || echo "✗ Login FAILED"

# Test 2: Productos
echo "Test de productos..."
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer TOKEN" \
  -s | grep -q "id" && echo "✓ Productos OK" || echo "✗ Productos FAILED"

# Test 3: Inventario
echo "Test de inventario..."
curl http://localhost:3000/api/inventory/warehouses \
  -H "Authorization: Bearer TOKEN" \
  -s | grep -q "id" && echo "✓ Inventario OK" || echo "✗ Inventario FAILED"

# Test 4: Transferencias
echo "Test de transferencias..."
curl http://localhost:3000/api/inventory/transfers \
  -H "Authorization: Bearer TOKEN" \
  -s | grep -q "sourceWarehouseId" && echo "✓ Transfers OK" || echo "✗ Transfers FAILED"
```

---

## 🔧 Mantenimiento del Plan DRP

### Pruebas Regulares de Recuperación

**Mensual**: Simular recuperación completa en servidor de prueba
```bash
# En máquina de test
sudo bash /path/to/setup-atlaserc.sh --from-backup /backups/atlaserc/latest
```

**Trimestral**: Recuperación real de BD
```bash
# Dropear e inmediatamente restaurar
pg_dump -U atlas_user erp_carniceria > /tmp/pre_test.sql
# ... hacer restauración ...
psql -U atlas_user -d erp_carniceria < /tmp/pre_test.sql
```

**Anual**: Auditoría completa del DRP

### Documentación Requerida

```
□ Credenciales de acceso (Guardadas seguramente)
  □ Usuario BD: atlas_user
  □ Contraseña BD: ____________
  □ JWT_SECRET: ____________
  □ Admin username: ____________
  □ Admin password: ____________

□ Ubicaciones de Backup
  □ Local: /backups/atlaserc/
  □ USB/Externo: ______________
  □ Cloud: ______________

□ Contactos de Emergencia
  □ Admin Técnico: ______________
  □ Respaldo Técnico: ______________
  □ Proveedor Hosting: ______________

□ Documentación
  □ DEPLOY_GUIDE.md - Completado
  □ DRP_PLAN.md (este archivo)
  □ setup-atlaserc.sh - Testeado
  □ Políticas de backup - Documentadas
```

### Documentación de Cambios

```bash
# Mantener registro de cambios
cat > /opt/AtlasERP/RECOVERY_LOG.md << 'EOF'
# Registro de Recuperaciones

## [FECHA] - Recuperación [TIPO]
- Causa: [descripción]
- Duración: X minutos
- Datos restaurados: Sí/No
- Observaciones: [notas]

EOF
```

---

## 📞 Matriz de Escalamiento

| Severidad | Tiempo Respuesta | Contactar | Acción |
|-----------|-----------------|-----------|---------|
| CRÍTICO | 15 min | Admin Tech | Activar DRP |
| ALTO | 30 min | Admin Tech | Evaluación |
| MEDIANO | 1 hora | Tech Lead | Investigar |
| BAJO | 4 horas | Tech Support | Monitorear |

---

## 🎯 Objetivos de Recuperación

| Objetivo | Target |
|----------|--------|
| **RTO** (Máx. tiempo downtime) | 6 horas |
| **RPO** (Máx. pérdida datos) | 2 horas |
| **Tasa éxito recuperación** | 100% |
| **Tiempo test mensual** | < 30 min |

---

## ⚠️ Advertencias Críticas

🔴 **NUNCA**:
- Borrar backups sin verificar restauración previa
- Cambiar contraseñas sin documentar
- Apagar BD sin backup reciente
- Ignorar alertas de espacio en disco
- Reutilizar contraseñas entre ambientes

✅ **SIEMPRE**:
- Verificar integridad de backups
- Documentar cambios realizados
- Probar procedimientos de recuperación
- Mantener múltiples copias de backups
- Encriptar backups externos

---

## 📋 Plantilla de Verificación Post-Incidente

```
INCIDENTE # [ID]
Fecha: ________
Tipo: ________
Duración: ________

Pasos tomados:
□ Servicio detenido
□ Backup realizado
□ Recuperación iniciada
□ Integridad verificada
□ Servicios reiniciados
□ Tests funcionales ejecutados

Tiempo total de recuperación: ________
Datos perdidos: ________
Causa raíz identificada: ________
Acciones preventivas: ________

Validado por: ________ Fecha: ________
```

---

**Última Actualización**: Dic 10, 2025  
**Próxima Revisión**: Dic 10, 2026  
**Status**: ✅ ACTIVO Y OPERATIVO

