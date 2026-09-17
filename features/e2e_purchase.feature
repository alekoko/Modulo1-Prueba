@e2e @regression
Feature: Flujo End-to-End de compra
  Como cliente de Swag Labs
  Quiero iniciar sesión, elegir productos, revisar mi carrito y pagar
  Para recibir la confirmación de mi orden

  @smoke @TC-10
  Scenario Outline: TC-10 Compra completa del set "<productos>" para "<cliente>"
    Given que el usuario navega a la página de login
    When inicia sesión con el usuario "<usuario>"
    Then debería visualizar el catálogo de productos

    When ordena los productos por "<orden>"
    And agrega al carrito los productos del set "<productos>"
    Then el contador del carrito debería reflejar los productos en el carrito

    When abre el carrito de compras
    Then el carrito debería contener los productos agregados
    And los precios en el carrito deberían coincidir con los del inventario

    When procede al checkout
    And completa la información de envío con el cliente "<cliente>"
    Then el resumen debería listar los productos agregados
    And el subtotal debería corresponder a la suma de los precios
    And el total debería corresponder al subtotal más impuestos

    When finaliza la compra
    Then debería visualizar la confirmación de la orden

    When regresa al inventario
    Then el carrito debería estar vacío
    When cierra la sesión desde el menú lateral
    Then debería regresar a la página de login

    Examples:
      | usuario  | orden                | productos            | cliente          |
      | standard | precio menor a mayor | producto_unico       | valid_customer   |
      | standard | nombre Z-A           | productos_especiales | valid_customer_2 |
