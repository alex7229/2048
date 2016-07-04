class Game {

    constructor () {
        this.field = [];
        this.fieldSize = 4;
    }
    
    setFieldSize (size) {
        this.fieldSize = size;
    }
    
    start () {
        this.field = [];
        for (let row=0; row<this.fieldSize; row++) {
            this.field[row] = [];
            for (let column=0; column<this.fieldSize; column++) {
                this.field[row][column] = 0
            }
        }
        this.fillRandomCell();
        this.fillRandomCell();
    }

    fillRandomCell () {
        if (!this.countEmptyCells()) return;
        let number = 2;
        if (Math.random()<0.2) {
            number = 4
        }
        let row = Math.floor(Math.random()*this.fieldSize);
        let column = Math.floor(Math.random()*this.fieldSize);
        if (this.field[row][column]) {
            this.fillRandomCell()
        } else {
            this.field[row][column] = number;
            console.log(`addCell. Field is ${JSON.stringify(this.field)}`);
        }
    }

    countEmptyCells () {
        let number = 0;
        this.field.forEach(row  => {
            row.forEach( cell => {
                if (cell === 0) {
                    number++
                }
            })
        });
        return number
    }
}

let game = new Game();