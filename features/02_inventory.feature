@inventory @regression
Feature: Módulo de Inventario
  Como cliente autenticado
  Quiero explorar y seleccionar productos del catálogo
  Para armar mi compra

  Background:
    Given que el usuario ha iniciado sesión como "standard"

  @TC-04
  Scenario Outline: TC-04 Ordenar el catálogo por <criterio>
    When ordena los productos por "<criterio>"
    Then los productos deberían mostrarse ordenados por "<criterio>"

    Examples:
      | criterio             |
      | nombre A-Z           |
      | nombre Z-A           |
      | precio menor a mayor |
      | precio mayor a menor |

  @smoke @TC-05
  Scenario: TC-05 Agregar y remover productos desde el inventario
    When agrega al carrito los productos del set "multiples_productos"
    Then el contador del carrito debería reflejar los productos en el carrito
    And los productos agregados deberían mostrar la opción de remover
    When remueve del inventario los productos agregados
    Then el carrito debería estar vacío
