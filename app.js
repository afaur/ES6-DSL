+(function() {

  const onToggleClick = (E) => {

    echo `Clicked toggle`

    const reportVisibility = (element, status) => {
      const isVisible = l`s|s==="visible"`
      if (isVisible(status)) {
        echo `Showing ${element.id}`
      } else {
        echo `Hiding ${element.id}`
      }
    }

    rID `
      react-main, dom-main
      #toggleDisplay
      ${reportVisibility}
    `
    E.target.silence `click`
    echo `Disabled click event for ${E.target}`
  }

  const onClickTest2 = (E) => { echo `Click test2 ${E}` }

  //const isOdd = (_, i) => (i % 2 == 1)
  const isOdd = l`~i|i%2==1`

  //const isEven = (_, i) => (i%2==1)
  const isEven = isOdd.negate

  const onDocLoad = () => {

    echo `Init`

    docSilence `load`
    echo `Cleared event listener for DOMContentLoaded`
    echo `Listeners being tracked: $__trackListeners`

    //document.getElementById('toggle').style.color = "blue"
    rID `toggle`.style.color = "blue"

    echo `Set button text color to blue`

    //Array.from( document.getElementsByClassName("links") )// [] Of HTMLElements
    //  .map( hlE => (Array.from(hlE.children)) )           // [] Of HTMLElements
    //  .forEach(x => {
    //    x.filter(isOdd).forEach(y => { y.style.color = "red" })
    //  })

    //rCN `links > ${isOdd} `.forEach( x => { x.style.color = "red"  } )
    //rCN `links > ${isEven}`.forEach( x => { x.style.color = "blue" } )

    //document.getElementsByClassName('green')
    rCN `links > ${isOdd}`.each `x|x.style.color='red'`
    rCN `links > ${isEven}`.each `x|x.style.color='blue'`

    rID `toggle`.listen `click ${onToggleClick}`
    echo `Bound click handler to button`

    const sayHelloAmt = 20
    l`${sayHelloAmt}`.times = `x|log("Hello " + x)`
    echo `Said "Hello: [iteration]" ${sayHelloAmt} times`

    //ReactDOM.render(
    //  <h1>Hello</h1>,
    //  document.getElementById('react-main')
    //)
    r`${
        _H('div.test1', {}, [
          _H('div.test2', {
            onClick: onClickTest2.bind(this)
          }, ["Hello"])
        ])
      }
    `.render `react-main`
  }

  echo `Listeners being tracked: $__trackListeners`

  docListen `load ${onDocLoad}`
  echo `Attached event listener for DOMContentLoaded`
  //echo `Saved Doc Listener: ${
  //    __trackListeners['doc'].filter( (x) => ( x.hasOwnProperty( "DOMContentLoaded" ) ) )
  //  }
  //`

  echo `Saved Doc Listener: ${
      __trackListeners['doc'].select `x|x.hasKey"DOMContentLoaded"`
    }
  `
})()
