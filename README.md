# Modulo1-Prueba
Framework Automatización Web (UI) Front-End (BDD)

Framework de automatización para [saucedemo.com](https://www.saucedemo.com) con **JavaScript + Selenium WebDriver 4 + Cucumber**, gestionado con **npm** y ejecutable en **Linux, Windows y Docker**.

Está construido sobre **tres patrones de diseño**:

1. **Page Object Model (POM)**
2. **Data-Driven**
3. **Context Object + Inyección de Dependencias (DI)**

| Selección Tecnica |
| Lenguaje | JavaScript (Node.js ≥ 18) |
| Automatización | selenium-webdriver 4 (Selenium Manager descarga los drivers) |
| Runner / BDD | @cucumber/cucumber 11 + Gherkin (palabras clave en inglés, pasos en español) |
| Aserciones | Chai |
| Logs | Winston |
| Reportes | multiple-cucumber-html-reporter + HTML nativo de Cucumber |
| Datos | JSON (formato único) + `.env` |
| Notificaciones | Email (Nodemailer) y Slack, con modo simulado |
| Contenedores | Docker + Selenium Standalone Chrome |

----
## 1. Estructura del proyecto

```
saucedemo-automation/
├── config/
│   ├── environments.json         # URL, navegador, timeouts y reintentos
│   └── index.js                  # une environments.json + variables de entorno
├── test-data/                    # ── DATA-DRIVEN ──
│   ├── users.json                # credenciales
│   ├── customers.json            # datos de envío
│   ├── catalog.json              # productos, criterios de orden, impuesto
│   └── messages.json             # textos esperados
├── features/                     # escenarios BDD en Gherkin
├── src/
│   ├── pages/                    # ── PAGE OBJECT MODEL ──
│   │   ├── BasePage.js           # acciones comunes (click, type, waits, reintentos)
│   │   ├── locator.js            # helpers de localizadores con fallback
│   │   ├── LoginPage.js … CheckoutCompletePage.js
│   │   └── components/           # Header y lista de productos del carrito
│   ├── data/
│   │   └── DataProvider.js       # ── DATA-DRIVEN: acceso a test-data ──
│   ├── context/
│   │   └── ScenarioContext.js    # ── CONTEXT OBJECT: estado entre pasos ──
│   ├── support/
│   │   ├── world.js              # ── DI: arma e inyecta dependencias por escenario ──
│   │   ├── hooks.js              # ciclo de vida, logs, evidencias
│   │   ├── driver.js             # creación del navegador (local o Grid)
│   │   └── evidence.js           # capturas de pantalla
│   ├── steps/                    # step definitions (solo usan lo inyectado en this)
│   ├── reporting/                # resumen, zip, mensaje y notificaciones
│   └── utils/                    # logger, esperas, reintentos, helpers
├── scripts/                      # run-suite, generate-report, notify, clean
├── cucumber.js
├── Dockerfile / docker-compose.yml
└── .env.example
```

---
## 2. Patrones de diseño

### 2.1 Page Object Model (POM)
### 2.2 Data-Driven
### 2.3 Context Object + Inyección de Dependencias (DI)

### 2.4 Cómo trabajan juntos

```
  F[Feature + Examples] -->|claves| S[Step]
  W[CustomWorld<br/>DI] -->|this.data| S
  W -->|this.context| S
  W -->|this.pages| S
  S -->|getUser, getCustomer| D[DataProvider<br/>Data-Driven]
  D --> J[(test-data/*.json)]
  S -->|login, addProduct| P[Page Objects<br/>POM]
  S <-->|set / get| C[ScenarioContext<br/>Context Object]
  W -->|driver + config + logger| P
  P --> B[Selenium WebDriver]
```
## 3. Casos de prueba

| ID | Módulo | Escenario | Ejecuciones |
|---|---|---|---|
| TC-01 | Login | Login exitoso (standard y performance_glitch) | 2 |
| TC-02 | Login | Login rechazado: bloqueado, contraseña incorrecta, usuario vacío, contraseña vacía | 4 |
| TC-03 | Login | Cierre de sesión | 1 |
| TC-04 | Inventario | Ordenar por nombre A-Z/Z-A y precio asc/desc | 4 |
| TC-05 | Inventario | Agregar y remover productos, validar contador y botones | 1 |
| TC-06 | Carrito | Productos y precios coinciden con el inventario | 1 |
| TC-07 | Carrito | Remover un producto y seguir comprando | 1 |
| TC-08 | Checkout | Campos obligatorios: nombre, apellido, código postal | 3 |
| TC-09 | Checkout | Subtotal, impuesto (8 %) y total correctos | 1 |
| TC-10 | **E2E** | Login → orden → carrito → checkout → confirmación → logout | 2 |

Son **10 casos y 20 ejecuciones**. Tags: `@smoke @regression @login @inventory @cart @checkout @e2e @negative @flaky @TC-xx`.

## 4. Instalación y ejecución (Linux, Windows y VS Code)

```bash
npm install
cp .env.example .env          # Windows PowerShell: Copy-Item .env.example .env
```

| Comando | Descripción |
|---|---|
| `npm run suite` | **Recomendado:** limpia, ejecuta, genera el dashboard y notifica |
| `npm run suite -- --tags "@smoke"` | Filtrar por tags |
| `npm run suite -- --tags "@TC-10" --no-notify` | Un caso, sin notificar |
| `npm test` | Solo Cucumber |
| `npm test:tc` | Solo cucumber por TC |
| `npm run test:headless` | Sin ventana del navegador |
| `npm run test:parallel` | 3 escenarios en paralelo |
| `npm run test:firefox` | Ejecutar en Firefox |
| `npm run test:rerun` | Re-ejecutar solo los escenarios fallidos |

En VS Code: abre la carpeta del proyecto, abre la terminal (`` Ctrl + ` ``) y ejecuta los comandos, o usa la sección **NPM SCRIPTS** del Explorer.

Los scripts son Node puro (sin `rm -rf` ni `&&`) y usan `cross-env`, así que funcionan igual en Windows y Linux.

## 5. Estrategia de localización y selectores dinámicos

Cada localizador tiene un nombre legible y estrategias de respaldo en orden: `data-test` → `id`/clase CSS → XPath por texto visible. Todas se evalúan en el mismo ciclo de espera, así el fallback no multiplica el tiempo.

Los botones de cada producto se construyen con el nombre que viene del JSON:

```js
addButton: (name) => locator(`Inventory.add(${name})`,
  dataTest(`add-to-cart-${toSlug(name)}`),      // "Test.allTheThings() T-Shirt (Red)"
  By.id(`add-to-cart-${toSlug(name)}`),         //  -> add-to-cart-test.allthethings()-t-shirt-(red)
  By.xpath(`${cardByName(name)}//button[starts-with(@id,'add-to-cart')]`)),
```

## 6. Robustez

- **Waits:** solo explícitas (`implicit: 0`, sin `sleep`): visible, clickable, desaparición, URL, `document.readyState` y condiciones como el contador del carrito. `performance_glitch_user` valida que se tolera la lentitud.
- **Reintentos en tres niveles:**
  1. **Acción:** click, escritura y lectura ante elementos obsoletos o interceptados.
  2. **Red:** creación del navegador y navegación ante `ECONNRESET` o `net::ERR_*`.
  3. **Escenario:** `RETRY` de Cucumber, que se puede limitar a `@flaky`, y el perfil `rerun`.
- **Excepciones:** un escenario fallido no detiene la suite. El `After` cierra el navegador en un `finally`, y las capturas y notificaciones nunca lanzan errores. El reporte se genera siempre y el proceso termina con código 1 si hubo fallas.
- **Logs:** cada línea lleva timestamp, worker y clase, e incluye pasos con ✔/✖, reintentos y errores. Las contraseñas se enmascaran. Se guardan en `logs/execution.log` y `logs/errors.log`.
- **Aserciones:** Chai con mensajes descriptivos (`to.have.members`, `closeTo` para montos, `deep.equal` para ordenamientos).

## 7. Reportería y evidencias

**multiple-cucumber-html-reporter** (`reports/dashboard/index.html`):
- Lee el JSON estándar de Cucumber, así que es compatible con Cucumber JS y Selenium.
- Muestra las capturas dentro de cada paso, gráficos y metadatos de navegador y plataforma.
- Es Node puro (sin Java) y funciona igual en Windows, Linux y Docker.

**HTML nativo de Cucumber** (`reports/html/cucumber-report.html`): es un solo archivo con las imágenes incluidas, ideal como adjunto.

**Evidencias:** se toma una captura en cada paso (`SCREENSHOT_MODE=all`). En una falla, la captura también se guarda en `reports/screenshots/<escenario>/FAILED_*.png`, junto con la URL y el título de la página.

## 8. Notificaciones

Al terminar, se resume la ejecución, se comprimen los reportes y se envían por los canales de `NOTIFY_CHANNELS`:

| Canal | Configuración | Adjunto |
|---|---|---|
| Email | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `EMAIL_TO` | ✔ HTML + zip |
| Slack (bot) | `SLACK_BOT_TOKEN` + `SLACK_CHANNEL_ID` (el bot debe estar invitado al canal) | ✔ |
| Slack (webhook) | `SLACK_WEBHOOK_URL` | ✖ solo texto |

**Modo simulado (`NOTIFY_DRY_RUN=true`, por defecto):** valida la configuración y guarda el mensaje exacto que se enviaría en `reports/notifications/<canal>-<ts>.json`. Para envío real: `NOTIFY_DRY_RUN=false` y completar las credenciales.

## 9. Docker

```bash
npm run docker:test
PARALLEL=3 TAGS="@smoke" docker compose up --build --abort-on-container-exit --exit-code-from tests
```

Levanta Selenium Chrome (con healthcheck y vista en vivo en `http://localhost:7900`, password `secret`) y el contenedor de pruebas. Los reportes y logs quedan en tu carpeta local.


