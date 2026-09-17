@login @regression
Feature: Modulo de Login
  Como cliente de Swag Labs
  Quiero autenticarme en la tienda
  Para acceder al catálogo de productos

  Background:
    Given que el usuario navega a la página de login

  @smoke @TC-01
  Scenario Outline: TC-01 Login exitoso con el perfil "<usuario>"
    When inicia sesión con el usuario "<usuario>"
    Then debería visualizar el catálogo de productos

    Examples: Usuario estándar
      | usuario  |
      | standard |

    @flaky
    Examples: Usuario con latencia (valida esperas explícitas)
      | usuario            |
      | performance_glitch |

  @negative @TC-02
  Scenario Outline: TC-02 Login rechazado - <caso>
    When inicia sesión con el usuario "<usuario>"
    Then debería visualizar el mensaje de error "<mensaje>"
    And debería permanecer en la página de login

    Examples:
      | caso                  | usuario          | mensaje                  |
      | usuario bloqueado     | locked_out       | login.lockedOut          |
      | contraseña incorrecta | invalid_password | login.invalidCredentials |
      | usuario vacío         | empty_username   | login.usernameRequired   |
      | contraseña vacía      | empty_password   | login.passwordRequired   |

  @TC-03
  Scenario: TC-03 Cierre de sesión desde el menú lateral
    When inicia sesión con el usuario "standard"
    And cierra la sesión desde el menú lateral
    Then debería regresar a la página de login
