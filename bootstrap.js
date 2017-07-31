+(function(){
  window.__trackListeners = { "win": [], "doc": [], "ele": [] }

  window.r = function() {
    let inputStr      = arguments[0][0].trim()
    let inputMaybeVar = arguments[1]
    let o = {hyperScript: inputMaybeVar}
    let defP = Object.defineProperty(o, 'render', {
      value: function() {
        let RHS = arguments[0][0].trim()
        const id = rID `${RHS}`
        if (window["ReactDOM"] === undefined) {
          throw "Must include ReactDOM"
        } else {
          ReactDOM.render(this.hyperScript, id)
        }
      }
    })
    return o
  }

  window.l = function() {
    let inputStr      = arguments[0][0].trim()
    let inputMaybeVar = arguments[1]
    let shortFnString, parsed
    // Handle number iteration
    if (/^\d+$/.test(inputStr) || /^\d+$/.test(inputMaybeVar)) {
      if (window['_n'] !== undefined) {
        return window['_n'](inputStr, inputMaybeVar)
      } else {
        throw "`addNumberIteration` must be enabled"
      }
    }
    // Handle different argument arrangements
    if (inputStr === "" && typeof inputMaybeVar === "string") {
      shortFnString = inputMaybeVar
      parsed = /(.+)\|(.+)/.exec(shortFnString)
    } else {
      shortFnString = inputStr
      parsed = /(.+)\|(.+)/.exec(shortFnString)
    }
    // Create a function from arguments
    let [_, args, fnBody] = parsed
    args   = args.replace(/~/g,"_,").split(',')
    fnBody = "return "+fnBody.replace(/"/g,"`")
    fnBodyInvert = fnBody
      .replace("return ", "return !(")
      .concat(")")
    fn = new Function(...args, fnBody)
    fn.__negation = new Function(...args, fnBodyInvert)
    return fn
  }

  //rID `react-main,dom-main#toggleDisplay${readResponseStatus}`
  window.rID = function () {
    let inputStr      = arguments[0][0].trim()
    let inputMaybeVar = arguments[1]
    // If we have multiple ids to retreive
    // and if we should execute a method on them
    if (/#/.test(inputStr) && /#/.test(inputStr)) {
      var [ids, method] = inputStr.trim().split("#")
      var ids = ids.split(",")
      let fn = inputMaybeVar
      ids.forEach((id) => {
        let ele = document.getElementById(id.trim())
        let status = ele[method.trim()]
        fn(ele, status)
      })
    } else {
      if (inputStr === "") {
        return document.getElementById(inputMaybeVar)
      } else {
        return document.getElementById(inputStr)
      }
    }
  }

  window.rCN = function () {
    let c, f, d
    d = document
    if (arguments[1] !== undefined) {
      c = arguments[0][0].trim().split(" ")
      f = arguments[1]
      let classResults, selectorResults = []
      c.forEach((item) => {
        if (item === ">") {
          classResults.forEach((classResult) => {
            classResultChildren = Array.from(classResult.children)
            selectorResults = classResultChildren.filter(f)
          })
        } else {
          classResults = Array.from(d.getElementsByClassName(item))
        }
      })
      if (selectorResults.length === 0) {
        return classResults
      } else {
        return selectorResults
      }
    } else {
      c = arguments[0][0]
      return Array.from(d.getElementsByClassName(c))
    }
  }

  window.log = (...args) => {console.log(...args)}

  window.echo = function() {
    let v = [], m = [], msg = "", args = arguments
    for (let i=1; i < args.length; i++) {
      v.push(args[i])
    }
    for (let i=1; i < args[0].length; i++) {
      m.push(args[0][i].trim())
    }
    if (/\$|@/.test(args[0][0]) === true) {
      const globalExpansion = function (_, m) { return JSON.stringify(eval(m), null, 4) }
      const windowExpansion = function (_, m) { return JSON.stringify(window[m], null, 4) }
      msg = args[0][0].replace(/@(\w+)/g, globalExpansion)
      msg = args[0][0].replace(/\$(\w+)/g, windowExpansion)
    }
    console.log(args[0][0].trim()+msg.trim(), ...v, ...m)
  }

  window._ListenFn = function (type, event, callback) {
    let typeFn
    if (type === "doc")   { typeFn = document.addEventListener }
    if (type === "win")   { typeFn = window.addEventListener }
    if (event === "load") { event = "DOMContentLoaded" }
    __trackListeners[type].push({[event]: callback})
    if (type === "ele") {
      this.addEventListener(event, callback)
      if (event === "click") {
        // Prevent highlight of element on click
        this.style["-webkit-user-select"] = "none"
        this.style["-moz-user-select"] = "none"
        this.style["-ms-user-select"] = "none"
        this.style["cursor"] = "hand"
      }
    } else {
      typeFn(event, callback)
    }
  }

  window._SilenceFn = function (type, event) {
    let typeFn
    if (type === "doc")   { typeFn = document.removeEventListener }
    if (type === "win")   { typeFn = window.removeEventListener }
    if (event === "load") { event = "DOMContentLoaded" }
    const getItemFn = (item) => (item.hasOwnProperty(event))
    if (type === "ele") {
      this.removeEventListener(event, __trackListeners[type].filter(getItemFn)[0][event])
      if (event === "click") {
        this.style["-webkit-user-select"] = "auto"
        this.style["-moz-user-select"] = "auto"
        this.style["-ms-user-select"] = "auto"
        this.style["cursor"] = "auto"
      }
    } else {
      typeFn(event, __trackListeners[type].filter(getItemFn)[0][event])
    }
    const getOthersFn = (item) => (!item.hasOwnProperty(event))
    __trackListeners[type] = __trackListeners[type].filter(getOthersFn)
  }

  const addEventManagement = () => {
    const ept   = Element.prototype
    const tlc   = (v) => (v.toLowerCase())
    const pre   = ["doc", "win"]
    const suf   = ["Listen", "Silence"]
    for (let i=0; i<pre.length; i++) {
      for (let j=0; j<suf.length; j++) {
        const variable = pre[i] + suf[j]
        window[variable] = function() {
          const evt = arguments[0][0].trim()
          const fn  = arguments[1]
          window["_"+suf[j]+"Fn"].call(null,pre[i],evt,fn)
        }
        if (i === 0) {
          ept[tlc(suf[j])] = function() {
            const evt = arguments[0][0].trim()
            const fn  = arguments[1]
            window["_"+suf[j]+"Fn"].call(this,"ele",evt,fn)
          }
        }
      }
    }
  }
  const addElementVisibilityManagement = () => {
    const ept   = Element.prototype
    const defP = Object.defineProperty
    defP(ept, 'toggleDisplay', {
      get: function() {
        if (this.style.display === "inherit" || this.style.display === "") {
          this.style.display = "none"
          return "hidden"
        } else {
          this.style.display = "inherit"
          return "visible"
        }
      },
      enumerable: false
    })
  }
  const addArrayFiltration = () => {
    const apt = Array.prototype
    apt['select'] = function() {
      const shortFnString = arguments[0][0].trim()
      const parsed = /(.+)\|(.+)/.exec(shortFnString)
      let [_, args, fnBody] = parsed
      args   = args.split(',')
      fnBody = "return "+fnBody.replace(/"/g,"`")
      fn = new Function(...args, fnBody)
      return this.filter(fn)
    }
    apt['reject'] = function() {
      const shortFnString = arguments[0][0].trim()
      const parsed = /(.+)\|(.+)/.exec(shortFnString)
      let [_, args, fnBody] = parsed
      args   = args.split(',')
      fnBody = "return !"+fnBody.replace(/"/g,"`")
      fn = new Function(...args, fnBody)
      return this.filter(fn)
    }
  }
  const addArrayIteration = () => {
    const apt = Array.prototype
    apt['each'] = function() {
      const shortFnString = arguments[0][0].trim()
      const parsed = /(.+)\|(.+)/.exec(shortFnString)
      let [_, args, fnBody] = parsed
      args   = args.split(',')
      fnBody = "return "+fnBody.replace(/"/g,"`")
      fn = new Function(...args, fnBody)
      return this.forEach(fn)
    }
  }
  const addFunctionNegation = () => {
    const fpt  = Function.prototype
    const defP = Object.defineProperty
    defP(fpt, 'negate', {
      get: function() {
        if (this.hasOwnProperty('__negation')) {
          return this.__negation
        } else {
          throw "Negation of native functions is unsupported."
        }
      },
      enumerable: false
    })
  }
  const addObjectInspection = () => {
    const opt = Object.prototype
    const defP = Object.defineProperty
    defP(opt, 'hasKey', {
      value: function() {
        const key = arguments[0][0].trim()
        return this.hasOwnProperty(key)
      },
      enumerable: false
    })
  }
  const addNumberIteration = () => {
    window["_n"] = function(inputStr, inputMaybeVar) {
      let o
      if (/\d+/.test(inputMaybeVar)) {
        o = {value: inputMaybeVar}
      } else { o = {value: inputStr} }
      const defP = Object.defineProperty
      defP(o, 'times', {
        set: function() {
          const fn = l`${arguments[0]}`
          Array
            .from({length: this.value})
            .forEach((_,i) => { fn(i+1) })
        }
      })
      return o
    }
  }
  addEventManagement()
  addElementVisibilityManagement()
  addArrayFiltration()
  addArrayIteration()
  addFunctionNegation()
  addObjectInspection()
  addNumberIteration()
})()
