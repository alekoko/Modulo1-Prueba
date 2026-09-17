'use strict';
const BasePage = require('./BasePage');
const { By, locator, dataTest } = require('./locator');

const L = {
  username: locator('Login.username', dataTest('username'), By.id('user-name')),
  password: locator('Login.password', dataTest('password'), By.id('password')),
  submit: locator('Login.submit', dataTest('login-button'), By.id('login-button')),
};

class LoginPage extends BasePage {
  get path() {
    return '/';
  }

  get readyLocator() {
    return L.submit;
  }

  /** La ruta "/" coincide con cualquier URL, por eso solo se valida el formulario. */
  async waitUntilLoaded() {
    await this.waits.visible(L.submit);
  }

  /** @param {{username:string, password:string, alias?:string}} user */
  async login(user) {
    this.log.info(`Iniciando sesión con el perfil "${user.alias || user.username}"`);
    await this.type(L.username, user.username);
    await this.type(L.password, user.password, { sensitive: true });
    await this.click(L.submit);
  }
}

module.exports = LoginPage;
