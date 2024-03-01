class Calculator {
  #operatorRegEx = /[+\-*\/\^]/g; //Para buscar operadores
  #operandRegEx = /\d+(\.\d+)?/g; //Para buscar operandos

  constructor() {}

  calculate(str = "") {
    if (!this.#isValid(str, str.startsWith("-")))
      return console.log("Operación no válida");

    let result = str;

    // Iteramos sobre los niveles de jerarquía de las operaciones
    for (let i = 2; i > -1; i--) {
      let matchResult = result.match(this.#buildOpRegex(i));
      let includesOperation = matchResult ? matchResult[0] : null;

      if (!includesOperation) continue;

      let rawOperation, operands, operator, partialR;

      while (Boolean(includesOperation)) {
        // Ajustamos el signo negativo si es necesario
        if (result.startsWith("-")) includesOperation = "-" + includesOperation;
        rawOperation = includesOperation;
        operands = rawOperation.split(/[^\d.]+/);
        operator = rawOperation.match(/[^\d.]+/g);

        if (operands.length === 3) {
          partialR = this.#doOperation(
            operator[1],
            parseFloat(-operands[1]),
            parseFloat(operands[2])
          );
        } else {
          partialR = this.#doOperation(
            operator[0],
            parseFloat(operands[0]),
            parseFloat(operands[1])
          );
        }

        result = result.replace(rawOperation, partialR);

        matchResult = result.match(this.#buildOpRegex(i));
        includesOperation = matchResult ? matchResult[0] : null;
      }
    }

    return parseFloat(result);
  }

  /*
    
    buildOpRegex: método que crea una expresión regular que coincide con una operación en el formato 'a x b',
    donde 'a' y 'b' son operandos y 'x' es un operador. Dependiendo del parámetro, la función 
    coincide con cierto nivel de jerarquía.

    Niveles de jerarquía:

    0 - Sumas y restas
    1 - Multiplicación y división
    2 - Potencias y raíces (las raíces aún no son compatibles)
    
    */

  #buildOpRegex(level) {
    let aux;
    switch (level) {
      case 0:
        aux = "+\\-";
        break;
      case 1:
        aux = "*\\/";
        break;
      case 2:
        aux = "\\^";
        break;
      default:
        throw new Error("Nivel de jerarquía de op no válido");
    }

    const str = "\\d+(\\.\\d+)?[" + aux + "]\\d+(\\.\\d+)?";

    return new RegExp(str);
  }

  /* 
    Para ser una operación válida, debe haber un operador más que operandos, a menos que comience con un signo menos,
    en cuyo caso deben haber la misma cantidad de operadores que de operandos.
  */

  #isValid(str = "", startWithMinus = false) {
    if (str.length > 20) return false;

    const operators = str.match(this.#operatorRegEx).length;
    const operands = str.match(this.#operandRegEx).length;

    return startWithMinus ? operators === operands : operators + 1 === operands;
  }

  #doOperation(operator, n1, n2) {
    switch (operator) {
      case "*":
        return n1 * n2;
      case "/":
        return n1 / n2;
      case "+":
        return n1 + n2;
      case "-":
        return n1 - n2;
      case "^":
        return n1 ** n2;
      default:
        throw new Error("Operador no reconocido");
    }
  }
}

const cal = new Calculator();

console.log(cal.calculate("4-7+8+9/2*3"));

//21
console.log(cal.calculate("4-7+8+9/2*3+2+3+2+1+1"));

// console.log(cal.calculate("-10-5"));
// console.log(cal.calculate("2-3-4-100"));
// console.log(cal.calculate("-2-2"));
// console.log(cal.calculate("-2.4-10"));
// console.log(cal.calculate("10*1/2^2"));
// console.log(cal.calculate("2+2-10"));
// console.log(cal.calculate("2/0"));
