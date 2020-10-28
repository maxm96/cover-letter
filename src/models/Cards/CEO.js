const Card = require('../Card')

module.exports = class CEO extends Card
{
    constructor() {
        super(
            'CEO',
            'Discard if with Motivational Speaker or Salaried Worker.',
            1,
            7,
            false
        )
    }

    /**
     * Nothing happens.
     */
    apply() {
        return true
    }
}