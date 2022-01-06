//Import
require('cypress-plugin-tab')
var fs = require('fs')
const appName = Cypress.env('appName')|| "your app"
const events = Cypress.env('events')|| 100
const delay = Cypress.env('delay') || 100
var password = Cypress.env('password')
var url = Cypress.env("baseUrl")
var viewportHeight = Cypress.config("viewportHeight")
var viewportWidth = Cypress.config("viewportWidth")
var curX = 0
var curY = 0
var evtIndex = 1
var focused = false

var totalEvents=50;
var clickEvents=15;
var hoverEvents=15;
var typeKeysEvents=10;
var pressKeysEvents=5;
var navEvents=5;

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
}

function fullPath(el){
    var names = [];
    while (el.parentNode){
      if (el.id){
        names.unshift('#'+el.id);
        break;
      }else{
        if (el==el.ownerDocument.documentElement) names.unshift(el.tagName);
        else{
          for (var c=1,e=el;e.previousElementSibling;e=e.previousElementSibling,c++);
          names.unshift(el.tagName+":nth-child("+c+")");
        }
        el=el.parentNode;
      }
    }
    return names.join(" > ");
}

function randClick(){
    
    let randX = getRandomInt(curX, viewportWidth)
    let randY = getRandomInt(curY, viewportHeight)
    
    cy.window().then((win)=>{
        let info = ""
        let element = win.document.elementFromPoint(randX, randY)
        if(!!element){
            if(!!element.id){
                cy.get(`#${element.id}`).click()
                info = `${element.tagName} with id: ${element.id}`
            }
            else{
                let jsPath = fullPath(element)
                cy.get(jsPath).then($candidates => {
                    for(let i = 0 ;i < $candidates.length; i++){
                        let candidate = $candidates.get(i)
                        if(!Cypress.dom.isHidden(candidate)){
                            cy.wrap(candidate).click({force:true})
                            break
                        }
                    }
                })
                info = `DOM element with path: ${jsPath}`
            }
        }
        else{
            cy.get('body').click(randX, randY, {force:true})
            info = `Position: (${randX}, ${randY}). INVALID, no selectable element`
        }
        cy.task("logCommand", { funtype: "Random click", info: info})
        focused = !!win.document.activeElement
    })
}

function randDClick(){

    let randX = getRandomInt(curX, viewportWidth)
    let randY = getRandomInt(curY, viewportHeight)
    
    cy.window().then((win)=>{
        let info = ""
        let element = win.document.elementFromPoint(randX, randY)
        if(!!element){
            if(!!element.id){
                cy.get(`#${element.id}`).dblclick()
                info = `${element.tagName} with id: ${element.id}`
            }
            else{
                let jsPath = fullPath(element)
                cy.get(jsPath).then($candidates => {
                    for(let i = 0; i < $candidates.length; i++){
                        let candidate = $candidates.get(i)
                        if(!Cypress.dom.isHidden(candidate)){
                            cy.wrap(candidate).dblclick({force:true})
                            break
                        }
                    }
                })
                info = `DOM element with path: ${jsPath}`
            }
        }
        else{
            cy.get('body').dblclick(randX, randY, {force:true})
            info = `Position: (${randX}, ${randY}). INVALID, no selectable element`
        }
        cy.task("logCommand", { funtype: "Random double click", info: info})
        focused = !!win.document.activeElement
    })
}

function randRClick(){
    
    let randX = getRandomInt(curX, viewportWidth)
    let randY = getRandomInt(curY, viewportHeight)
    
    cy.window().then((win)=>{
        let info = ""
        let element = win.document.elementFromPoint(randX, randY)
        if(!!element){
            if(!!element.id){
                cy.get(`#${element.id}`).rightclick()
                info = `${element.tagName} with id: ${element.id}`
            }
            else{
                let jsPath = fullPath(element)
                cy.get(jsPath).then($candidates => {
                    for(let i = 0; i < $candidates.length; i++){
                        let candidate = $candidates.get(i)
                        if(!Cypress.dom.isHidden(candidate)){
                            cy.wrap(candidate).rightclick({force:true})
                            break
                        }
                    }
                })
                info = `DOM element with path: ${jsPath}`
            }
        }
        else{
            cy.get('body').rightclick(randX, randY, {force:true})
            info = `Position: (${randX}, ${randY}). INVALID, no selectable element`
        }        
        cy.task("logCommand", { funtype: "Random right click", info: info})
        focused = !!win.document.activeElement
    })
}

function randHover(){
    
    let randX = getRandomInt(curX, viewportWidth)
    let randY = getRandomInt(curY, viewportHeight)

    cy.window().then((win)=>{
        let info = ""
        let element = win.document.elementFromPoint(randX, randY)
        if(!!element){
            if(element.hasAttribute('onmouseover')){
                if(!!element.id){ 
                    cy.get(`#${element.id}`).trigger('mouseover')
                    info = `${element.tagName} with id: ${element.id}`
                }
                else{
                    let jsPath = fullPath(element)
                    cy.get(fullPath(element)).then($candidates => {
                        for(let i = 0; i < $candidates.length; i++){
                            let candidate = $candidates.get(i)
                            if(!Cypress.dom.isHidden(candidate)){
                                cy.wrap(candidate).trigger('mouseover')
                                break
                            }
                        }
                    })
                    info = `DOM element with path: ${jsPath}`
                }
            }
            else info = `Position: (${randX}, ${randY}). INVALID, element has no attribute onmouseover`
        }
        else info = `Position: (${randX}, ${randY}). INVALID, no selectable element`
        cy.task("logCommand", { funtype: "Selector focus (hover)", info: info})
        focused = !!win.document.activeElement
    })
}

function reload(){
    cy.reload()
    focused = false
    cy.task("logCommand", { funtype: "Page navigation (Reload)", info: "Successfully reloaded the page"})
}

function navBack(){
    cy.url().then((path)=>{
        let info = ""
        if(url!==path){
            cy.go(-1)
            info = "Navigated 1 page back"
        }
        else info = "INVALID. Navigation stack empty"
        cy.task("logCommand", { funtype: "Page navigation (back)", info: info})
    })
}

function navForward(){
    cy.go(1)
    cy.task("logCommand", { funtype: "Page navigation (forward)", info: "Attempted to navigate 1 page forward"})
}

function enter(){
    let info = ""
    if(focused){
        cy.focused().type("{enter}")
        info = "Pressed enter on the element in focus"
    }
    else{
        cy.get('body').type("{enter}")
        info = "INVALID. No element is in focus"
    }
    cy.task("logCommand", { funtype: "Special key press (enter)", info: info})
}

function typeCharKey(){
    let info = ""
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let type = chars.charAt(getRandomInt(0, chars.length-1))
    if(focused){
        cy.focused().type(type)
        info = `Pressed the ${type} key on the element in focus`
    }
    else{
        cy.get('body').type(type)
        info = "INVALID. No element is in focus"
    }
    cy.task("logCommand", { funtype: "Key press", info: info})
}

function spkeypress(){
    let info = ""
    const specialKeys = ["{{}","{backspace}", "{del}","{downarrow}", "{end}", "{esc}","{home}",  "{leftarrow}", "{pagedown}", "{pageup}", "{rightarrow}", "{selectall}", "{uparrow}"]
    const modifiers = ["{alt}", "{ctrl}", "{meta}", "{shift}", ""]
    let modIndex = getRandomInt(0, modifiers.length-1)
    let spkIndex = getRandomInt(0, specialKeys.length-1)
    let type = modifiers[modIndex] + specialKeys[spkIndex]
    if(focused){
        cy.focused().type(type)
        info = `Pressed the ${type} combination of special keys on the element in focus`
    }
    else{
        cy.get('body').type(type)
        info = `No element is in focus. Pressed the ${type} combination of special keys on the page body`
    }
    cy.task("logCommand", { funtype: "Special key press", info: info})
}

function tab(){
    let info = ""
    if(focused){
        cy.focused().tab().focus()
        info = "Tabbed to the next element after the one in focus"
    }
    else{
        cy.get('body').tab().focus()
        info = "Tabbed into the first focusable element of the document"
    }
    focused = true
    cy.task("logCommand", { funtype: "Selector focus (tab)", info: info})
}

const functions = [
    [randClick, randDClick, randRClick],
    [randHover, tab], 
    [typeCharKey], 
    [spkeypress, enter], 
    [reload, navBack, navForward]
]

function randomEvent(){
    let typeIndex = getRandomInt(0, pending_events.length)
    if(pending_events[typeIndex] > 0){
        let fIndex = getRandomInt(0, functions[typeIndex].length-1)
        functions[typeIndex][fIndex]()
        pending_events[typeIndex] --
        cy.wait(delay)
    }
    else{
        functions.splice(typeIndex, 1)
        pending_events.splice(typeIndex, 1)
    }
}

function login(email, pass){
    cy.fixture('login.json').then((loginLocators) => {
        cy.get(loginLocators.inputEmail).type(email);
        cy.get(loginLocators.inputPassword).type(pass, { log: false });
        cy.contains('Log in').click();
      });
}

var pending_events = [,,,,] 

describe( `${appName} under monkeys`, function() { 
    it(`visits ${appName} and survives monkeys`, function() {

        cy.on('uncaught:exception', (err)=>{
            cy.task('genericLog', {'message':`An exception occurred: ${err}`});
            cy.task('genericReport', {'html': `<p><strong>Uncaught exception: </strong>${err}</p>`});
            return false;
        });
        cy.on('window:alert', (text)=>{
            cy.task('genericLog', {'message':`An alert was fired with the message: "${text}"`});
            cy.task('genericReport', {'html': `<p><strong>An alert was fired with the message: </strong>${text}</p>`});
            return false;
        });
        cy.on('fail', (err)=>{
            cy.task('genericLog', {'message':`The test failed with the following error: ${err}`});
            cy.task('genericReport', {'html': `<p><strong>Test failed with the error: </strong>${err}</p>`});
            return false;
        });

        cy.task('logStart', {"type":"monkey", "url":url})

        pending_events[0] = clickEvents
        pending_events[1] = hoverEvents
        pending_events[2] = typeKeysEvents
        pending_events[3] = pressKeysEvents
        pending_events[4] = navEvents
        
        cy.visit("https://dev.safefleetcloud.us/media-management/").then(()=>{  
            cy.wait(1000)
            login('bobby@yopmail.com', password);
            cy.wait(1000)
        })
        cy.wait(1000)
        for(let i = 0; i < totalEvents + 4; i++){
            evtIndex++
            randomEvent()
        }
        
    }) 
    afterEach(()=>{
        cy.task('logEnd')
    })
})
