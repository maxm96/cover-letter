/**
 * Convenience class to deal with some boilerplate.
 * @type {module.Component}
 */
module.exports = class Component extends HTMLElement
{
    constructor() {
        super()
    }

    getAttr(attr) {
        return this.getAttribute(attr) || ''
    }

    attShad(mode = 'open') {
        return this.attachShadow({ mode })
    }

    createContainer(el = 'div') {
        return document.createElement(el)
    }
}