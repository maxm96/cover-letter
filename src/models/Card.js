class Card
{
    constructor(name, description, count, number, requiresVictim = true) {
        this.name = name
        this.description = description
        this.count = count
        this.number = number
        this.requiresVictim = requiresVictim
    }
}