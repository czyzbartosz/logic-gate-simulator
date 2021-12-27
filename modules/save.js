import { ANDGate, NOTGate, MyGate, prepareGate } from "./Gate.js";
import { InputsElement } from "./InputsElement.js";
import { nInputsElement } from "./nInputsElement.js";
import { nOutputsElement } from "./nOutputsElement.js";
import { OutputsElement } from "./OutputsElement.js";
import { gates, presetsGates, wires, workArea } from "../main.js";
import { Wire } from "./Wire.js";

let projects = [];
let savedGates = [];
let savedPresetsGates = [];
let workAreaGates = [];
let savedWires = [];
let workAreaWires = [];
let projectIndex = 0;

export function loadSave() {
    const loadedProjects = getFromLocalStorage("projects");
    if(loadedProjects) {
        projects = [ ...loadedProjects ];
        const project = loadedProjects[projectIndex];
        if(project) {
            if(project.workAreaGates) {
                workAreaGates = [ ...project.workAreaGates ];
            }
            if(project.workAreaWires) {
                workAreaWires = [ ...project.workAreaWires ];
            }
            if(project.gates) {
                savedGates = [ ...project.gates ];
                addGates(savedGates);
            }
            if(project.presetsGates) {
                savedPresetsGates = [ ...project.presetsGates ];
                savedPresetsGates.forEach((obj) => {
                    presetsGates.push(new MyGate(presetsGates.length, obj.amountOfInputs, obj.amountOfOutputs, obj.functionString, obj.outputsArray, obj.name, obj.color, obj.makeStringArr, obj.stringIndexArr));
                });
            }
            if(project.wires) {
                savedWires = [ ...project.wires ];
                addWires(savedWires);
            }
        }   
    }
}

function addWires(loadWires) {
    loadWires.forEach((obj, index) => {
        const outputEl = gates[obj.output.gateId].outputs[obj.output.outputId].outputEl;
        const inputEl = gates[obj.input.gateId].inputs[obj.input.inputId].inputEl;
        if(obj.isDeleted) {
            wires.push(new Wire(outputEl, inputEl, true));
            wires[index].con.remove();
        }else {
            wires.push(new Wire(outputEl, inputEl));
            if(!workAreaWires.includes(index + "-wire")) {
                wires[index].con.remove();
            }
        }
    });
}

function addGates(loadGates) {
    loadGates.forEach((gate) => {
        const type = gate.type;
        if(type) {
            let obj;
            switch(type) {
                case "ANDGate": 
                    obj = new ANDGate();
                    break;
                case "NOTGate":
                    obj = new NOTGate();
                    break;
                case "OutputsElement":
                    obj = new OutputsElement(1);
                    break;
                case "InputsElement":
                    obj = new InputsElement(1);
                    break;
                case "nOutputsElement":
                    obj = new nOutputsElement(gate.n);
                    break;
                case "nInputsElement":
                    obj = new nInputsElement(gate.n);
                    break;
                case "MyGate":
                    obj = new MyGate(undefined, gate.amountOfInputs, gate.amountOfOutputs, gate.functionString, gate.outputsArray, gate.name, gate.color, gate.makeStringArr, gate.stringIndexArr);
            }
            obj.element.style.top = gate.position.top;
            obj.element.style.left = gate.position.left;
            prepareGate(obj);
            if(!workAreaGates.includes(obj.element.id)) {
                obj.element.remove();
            }
            gates[parseInt(obj.id)] = obj;
        }
    });
}

export function saveGate(gate) {
    const obj = {};
    const el = gate.element;
    if(gate instanceof ANDGate) {
        obj.type = "ANDGate";
    }else if(gate instanceof NOTGate) {
        obj.type = "NOTGate";
    }else if(gate instanceof OutputsElement) {
        obj.type = "OutputsElement";
    }else if(gate instanceof InputsElement) {
        obj.type = "InputsElement";
    }else if(gate instanceof nOutputsElement) {
        obj.type = "nOutputsElement";
        obj.n = gate.n;
    }else if(gate instanceof nInputsElement) {
        obj.type = "nInputsElement";
        obj.n = gate.n;
    }else if(gate instanceof MyGate) {
        obj.type = "MyGate";
        obj.amountOfInputs = gate.amountOfInputs;
        obj.amountOfOutputs = gate.amountOfOutputs;
        obj.functionString = gate.functionString;
        obj.outputsArray = gate.outputsArray;
        obj.name = gate.name;
        obj.color = gate.color;
        obj.makeStringArr = gate.makeStringArr;
        obj.stringIndexArr = gate.stringIndexArr;
    }
    obj.position = {};
    obj.position.top = el.style.top;
    obj.position.left = el.style.left;
    savedGates.push(obj);
    if(obj.type === "nOutputsElement" || obj.type === "nInputsElement") {
        for(let i = 0; i < obj.n; i++) {
            savedGates.push({});
        }
    }
    saveToLocalStorage();
}

export function saveToLocalStorage() {
    const project = {};
    project.gates = savedGates;
    project.presetsGates = savedPresetsGates;
    project.workAreaGates = getWorkAreaGates();
    project.workAreaWires = getWorkAreaWires();
    project.wires = savedWires;
    projects[projectIndex] = project;
    const string = JSON.stringify(projects);
    localStorage.setItem("projects", string);
}

function getFromLocalStorage(key) {
    const string = localStorage.getItem(key);
    return JSON.parse(string);
}

function getWorkAreaGates() {
    let workAreaGates = [ ...document.querySelectorAll(".work") ];
    workAreaGates = workAreaGates.map((gate) => {
        return gate.id;
    });
    console.log(workAreaGates);
    return workAreaGates;
}

function getWorkAreaWires() {
    let workAreaWires = [ ...document.querySelectorAll("path")] ;
    workAreaWires = workAreaWires.map((wire) => {
        return wire.id;
    });
    return workAreaWires;
}

export function updateGatePosition(gateId) {
    savedGates[gateId].position.top = gates[gateId].element.style.top;
    savedGates[gateId].position.left = gates[gateId].element.style.left;
    saveToLocalStorage();
}

export function savePresetsGate(gate) {
    const obj = {};
    obj.amountOfInputs = gate.amountOfInputs;
    obj.amountOfOutputs = gate.amountOfOutputs;
    obj.functionString = gate.functionString;
    obj.outputsArray = gate.outputsArray;
    obj.name = gate.name;
    obj.color = gate.color;
    obj.makeStringArr = gate.makeStringArr;
    obj.stringIndexArr = gate.stringIndexArr;
    savedPresetsGates.push(obj);
    saveToLocalStorage();
}

export function setWireToDeleted(wireId) {
    savedWires[wireId].isDeleted = true;
    saveToLocalStorage();
}

export function saveWire(outputObj, inputObj, wireIndex) {
    const wire = {};
    const outputArr = outputObj.id.split("-");
    const inputArr = inputObj.id.split("-");
    wire.isDeleted = wires[wireIndex].isDeleted;
    wire.output = { gateId: outputArr[1], outputId: outputArr[0] };
    wire.input = { gateId: inputArr[1], inputId: inputArr[0] };
    savedWires.push(wire);
    saveToLocalStorage();
}