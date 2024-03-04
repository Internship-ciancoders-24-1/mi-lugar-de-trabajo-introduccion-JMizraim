class Calculator {
  #operatorRegEx = /[\+\-\*\/\^]/g; //Para buscar operadores
  #operandRegEx = /\d+(\.\d+)?/g; //Para buscar operandos
  #parenthesisRegEx = /\(([^\(\)]+)\)/;

  constructor() {}

  #deepCalculation(input = "") {
    if (!this.#isValid(input, input.startsWith("-")))
      return console.log("Operación no válida");

    let result = this.#convertSqrtToPower(input);

    // Se itera sobre los niveles de jerarquía de las operaciones
    for (let i = 2; i > -1; i--) {
      let includesOperation = result.match(this.#buildOpRegex(i));

      if (!includesOperation) continue;

      let rawOperation, operands, operators, partialR;

      while (Boolean(includesOperation)) {
        rawOperation = includesOperation[0];

        // Se elimina el signo "-" (si hay) si rawOperation
        // no coincide con los caracteres de inicio de includesOperation.input
        const aux = includesOperation.input.slice(0, rawOperation.length);

        if (rawOperation !== aux && rawOperation.charAt(0) == "-") {
          rawOperation = rawOperation.slice(1, rawOperation.length);
        }

        operands = rawOperation.split(/[^\d\.]+/);
        operators = rawOperation.match(/[^\d\.]+/g);

        // Si hay dos operadores, entonces:
        // - El primero siempre será el signo negativo del primer operando
        // - El segundo será el del operador

        if (operators.length > 1) {
          partialR = this.#doOperation(
            operators[1],
            parseFloat(-operands[1]),
            parseFloat(operands[2])
          );
        } else {
          partialR = this.#doOperation(
            operators[0],
            parseFloat(operands[0]),
            parseFloat(operands[1])
          );
        }

        result = result.replace(rawOperation, partialR);
        includesOperation = result.match(this.#buildOpRegex(i));
      }
    }

    return parseFloat(result);
  }

  calculate(input = "") {
    if (!this.#hasNestedOperation(input)) {
      return this.#deepCalculation(input);
    } else {
      let nestedOperation = this.#nestedOperation(input);
      const prevResult = input.replace(
        `(${nestedOperation})`,
        this.calculate(nestedOperation)
      );
      return this.calculate(prevResult);
    }
  }

  #hasNestedOperation(input = "") {
    return Boolean(input.match(this.#parenthesisRegEx));
  }

  #nestedOperation(input = "") {
    return input.match(this.#parenthesisRegEx)[1];
  }

  /*
    buildOpRegex: Método que crea una expresión regular que coincide con una operación en el
    formato 'a x b', donde 'a' y 'b' son operandos y 'x' es un operador. Dependiendo del 
    parámetro, la función coincide con cierto nivel de jerarquía.    
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

    const str = "-?\\d+(\\.\\d+)?[" + aux + "]\\d+(\\.\\d+)?";

    return new RegExp(str);
  }

  /* 
    Para ser una operación válida, debe haber un operador más que operandos, 
    a menos que comience con un signo menos, en cuyo caso deben haber la misma 
    cantidad de operadores que de operandos.
  */

  #isValid(str = "", startWithMinus = false) {
    if (!str) return false;
    if (!isNaN(str)) return true;
    if (str.length > 20) return false;
    if (str.startsWith("sqrt") && !str.match(this.#operatorRegEx)) return true;

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

  #convertSqrtToPower(input = "") {
    let output = input;
    const interator = input.matchAll(/sqrt(\d+)(\.\d+)?/g);
    for (const match of interator) {
      const value = match[1] + (match[2] ?? "");
      output = output.replace(match[0], `${value}^0.5`);
    }
    return output;
  }
}

const cal = new Calculator();

const operations = [
  "4-7+8+9/2*3", //Expresión proporcionada para test
  "1-(sqrt4)",
  "1+(-2+sqrt16)",
  "5.2+1.2",
  "24*(1/2)",
  "2+sqrt16",
  "(2+1)",
  "(1+2)*(1+2)",
  "(4*2)+(1+2+(2-1))",
  "sqrt16",
  "sqrt(16/4+12)+2",
  "1",
  "-2",
];

operations.forEach((op) => {
  console.log(op, "=", cal.calculate(op));
});
