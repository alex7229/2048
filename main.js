class Game {

    constructor () {
        this.field = [];
        this.fieldSize = 4;
        this.mergingCell;
        this.fieldState;
    }
    
    setFieldSize (size) {
        this.fieldSize = size;
    }
    
    start () {
        this.field = [];
        for (let row=0; row<this.fieldSize; row++) {
            this.field[row] = [];
            for (let column=0; column<this.fieldSize; column++) {
                this.field[row][column] = {
                    value: 0,
                    row,
                    column
                }
            }
        }
        for (let i=0; i<2; i++) {
            this.fillRandomCell();
        }
        Draw.background(this.fieldSize);
        Draw.cells(this.field);
        score.reset()
    }

    fillRandomCell () {
        if (!this.countEmptyCells()) return;
        let number = 2;
        if (Math.random()<0.2) {
            number = 4
        }
        let row = Math.floor(Math.random()*this.fieldSize);
        let column = Math.floor(Math.random()*this.fieldSize);
        if (this.field[row][column].value) {
            this.fillRandomCell()
        } else {
            this.field[row][column].value = number;
        }
    }

    countEmptyCells () {
        let number = 0;
        this.field.forEach(row  => {
            row.forEach( cell => {
                if (cell.value === 0) {
                    number++
                }
            })
        });
        return number
    }

    mergeLeft () {
        this.field.forEach(row => {
            this.mergingCell = undefined;
            for (let column=0; column<this.fieldSize; column++) {
                let cell = row[column];
                this.merge(cell);
            }
        });
    }

    mergeRight () {
        this.field.forEach(row => {
            this.mergingCell = undefined;
            for (let column=this.fieldSize-1; column>=0; column--) {
                let cell = row[column];
                this.merge(cell);
            }
        });
    }

    mergeUp () {
        for (let column = 0; column<this.fieldSize; column++) {
            this.mergingCell = undefined;
            for (let row = 0; row<this.fieldSize; row++) {
                let cell = this.field[row][column];
                this.merge(cell)
            }
        }
    }

    mergeDown () {
        for (let column = 0; column<this.fieldSize; column++) {
            this.mergingCell = undefined;
            for (let row = this.fieldSize-1; row>=0; row--) {
                let cell = this.field[row][column];
                this.merge(cell)
            }
        }
    }

    merge (currentCell) {
        if (!this.mergingCell) {
            if (currentCell.value) {
                this.mergingCell = currentCell
            }
        } else if (currentCell.value) {
            if (this.mergingCell.value === currentCell.value) {
                this.mergingCell.value *= 2;
                score.addScore(this.mergingCell.value);
                this.mergingCell = undefined;
                currentCell.value = 0;
            } else {
                this.mergingCell = currentCell
            }
        }
    }

    moveLeft () {
        this.field.forEach(row => {
            this.sort(row)
        })
    }

    moveRight() {
        this.field.forEach(row => {
            let reverseRow = [];
            for (let column = row.length-1; column>=0; column --) {
                reverseRow.push(row[column])
            }
            this.sort(reverseRow)
        })
    }

    moveUp() {
        for (let column = 0; column<this.fieldSize; column++) {
            let cells = [];
            for (let row = 0; row<this.fieldSize; row++) {
                let cell = this.field[row][column];
                cells.push(cell)
            }
            this.sort(cells)
        }
    }

    moveDown() {
        for (let column = 0; column<this.fieldSize; column++) {
            let cells = [];
            for (let row = this.fieldSize-1; row>=0; row--) {
                let cell = this.field[row][column];
                cells.push(cell)
            }
            this.sort(cells)
        }
    }

    sort (cells) {
        let numberCellsCount = 0;
        cells.forEach(cell => {
            if (cell.value) {
                numberCellsCount++
            }
        });
        if (numberCellsCount === 0 || numberCellsCount === cells.length) return;
        for (let i=0; i<cells.length; i++) {
            if (cells[i].value === 0) {
                for (let j=i+1; j<cells.length; j++) {
                    if (cells[j].value) {
                        cells[i].value = cells[j].value;
                        cells[j].value = 0;
                        break
                    }
                }
            }
        }
    }

    saveFieldAsString () {
        this.fieldString = JSON.stringify(this.field);
    }

    checkFieldChanges () {
        let currentField = JSON.stringify(this.field);
        if (this.fieldString !== currentField) {
            return true
        }
    }

}

class Draw {

    static background (fieldSize) {
        let container = $('#gameContainer');
        let innerHtml = ``;
        for (let row=0; row<fieldSize; row++) {
            for (let column=0; column<fieldSize; column++) {
                if (column === 0) {
                    innerHtml+=`<div class="backgroundCell" style="clear:both"></div>`
                } else {
                    innerHtml+=`<div class="backgroundCell"></div>`
                }
            }
            innerHtml+=`<br>`
        }
        container.html(innerHtml);
    }

    static cells (field) {
        let container = $('#gameContainer');
        let cellsHTML = ``;
        field.forEach(row => {
            row.forEach(cell => {
                if (cell.value) {
                    let position = `left:${cell.column*100}px;top:${cell.row*100}px`;
                    cellsHTML+=`<div class="cell" data-value="${cell.value}" data-column="${cell.column}" data-row="${cell.row}" style="${position}">${cell.value}</div>`
                }

            })
        });
        container.append(cellsHTML)
    }
}

class Score {
    
    constructor () {
        this.topScore = 0;
        this.currentScore = 0;
        this.multiplier = 0;
        this.stepScore = 0;
    }
    
    getTopScore () {
        if (localStorage.topScore2048) {
            this.topScore = localStorage.topScore2048
        }
    }

    update () {
        $('#topScoreValue').html(this.topScore);
        $('#currentScoreValue').html(this.currentScore);
        console.log('updating')
    }

    addScore (value) {
        this.stepScore+=value;
        this.multiplier++
    }

    endStep () {
        this.currentScore+=this.stepScore*this.multiplier;
        this.stepScore = 0;
        this.multiplier = 0;
        if (this.currentScore>this.topScore) {
            this.topScore = this.currentScore;
            localStorage.topScore2048 = this.topScore
        }
        this.update()
    }

    reset () {
        this.currentScore = 0;
    }
    
}

class Controller {

    static listenArrowKeys () {
        document.onkeydown = e => {
            let key = e.keyCode;
            game.saveFieldAsString();
            if (key === 37) {
                game.mergeLeft();
                game.moveLeft();
            } else if (key === 38) {
                game.mergeUp();
                game.moveUp();
            } else if (key === 39) {
                game.mergeRight();
                game.moveRight();
            } else if (key === 40) {
                game.mergeDown();
                game.moveDown()
            }
            if (game.checkFieldChanges()) {
                game.fillRandomCell()
            }
            Draw.background(game.fieldSize);
            Draw.cells(game.field);
            score.endStep();
        }
    }

}


let game = new Game();

let score = new Score();

Controller.listenArrowKeys();

$(document).ready(()=> {
    score.getTopScore();
    score.update()
});



