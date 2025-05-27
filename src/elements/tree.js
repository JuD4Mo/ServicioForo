export class Nodo{
    constructor(valor){
        this.valor = valor;
        this.hijos = [];
    }

    agregarHijo (nodo){
        this.hijos.push(nodo);
    }
}

export function dfs(nodo){
    console.log(nodo.valor)
        for(let hijo of nodo.hijos){
            dfs(hijo);
    }
}

export function bfs(raiz){
    const cola = [raiz];
    while(cola.length > 0){
        const actual = cola.shift();
        console.log(actual.valor);
        cola.push(...actual.hijos);
    }
}