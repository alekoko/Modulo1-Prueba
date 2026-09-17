@cart @regression
Feature: Módulo de Carrito de compras
  Como cliente autenticado
  Quiero revisar y ajustar los productos de mi carrito
  Para confirmar lo que voy a comprar

  Background:
    Given que el usuario ha iniciado sesión como "standard"
    And agrega al carrito los productos del set "multiples_productos"
    And abre el carrito de compras

  @smoke @TC-06
  Scenario: TC-06 El carrito muestra los productos y precios seleccionados
    Then el carrito debería contener los productos agregados
    And los precios en el carrito deberían coincidir con los del inventario

  @TC-07
  Scenario: TC-07 Remover un producto del carrito y seguir comprando
    When remueve del carrito el primer producto agregado
    Then el carrito no debería contener el producto removido
    And el contador del carrito debería reflejar los productos en el carrito
    When continúa comprando
    Then debería visualizar el catálogo de productos
