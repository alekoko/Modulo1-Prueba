@checkout @regression
Feature: Proceso de compra (Checkout)
  Como cliente con productos en el carrito
  Quiero completar mis datos de envío y revisar la orden
  Para concretar la compra correctamente

  Background:
    Given que el usuario ha iniciado sesión como "standard"
    And agrega al carrito los productos del set "multiples_productos"
    And abre el carrito de compras
    And procede al checkout

  @negative @TC-08
  Scenario Outline: TC-08 Validación de campos obligatorios - <caso>
    When completa la información de envío con el cliente "<cliente>"
    Then debería visualizar el mensaje de error "<mensaje>"
    And debería permanecer en el paso de información de envío

    Examples:
    | caso                 | cliente             | mensaje                     |
    | sin nombre           | missing_first_name  | checkout.firstNameRequired  |
    | sin apellido         | missing_last_name   | checkout.lastNameRequired   |
    | sin código postal    | missing_postal_code | checkout.postalCodeRequired |

  @smoke @TC-09
  Scenario: TC-09 El resumen de la orden calcula correctamente los importes
    When completa la información de envío con el cliente "valid_customer"
    Then el resumen debería listar los productos agregados
    And el subtotal debería corresponder a la suma de los precios
    And el total debería corresponder al subtotal más impuestos
