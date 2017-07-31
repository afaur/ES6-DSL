+(function() {
  const classIdSplit = /([\.#]?[a-zA-Z0-9_:-]+)/
  const notClassId = /^\.|#/

  const parseTag = (tag, props) => {
    if (!tag) { return 'div' }

    let tagParts = tag.split(classIdSplit)
    let tagName = null

    if (notClassId.test(tagParts[1])) { tagName = 'div' }

    for (let i = 0; i < tagParts.length; i++) {
      var classes, type

      let part = tagParts[i]
      let noId = !('id' in props)

      if (!part) { continue }

      type = part.charAt(0)

      if (!tagName) {
        tagName = part
      } else if (type === '.') {
        classes = classes || []
        classes.push(part.substring(1, part.length))
      } else if (type === '#' && noId) {
        props.id = part.substring(1, part.length)
      }
    }

    if (classes) {
      if (props.className) { classes.push(props.className) }
      props.className = classes.join(' ')
    }

    return tagName ? tagName.toLowerCase() : 'div'
  }

  const isChildren = (x) => {
    return typeof x === 'string' || typeof x === 'number' || Array.isArray(x)
  }

  window['_H'] = function(componentOrTag, properties, children) {
    // If a child array or text node are passed as the second argument, shift them
    if (!children && isChildren(properties)) {
      children = properties
      properties = {}
    } else if (arguments.length === 2) {
      // If no children were passed, we don't want to pass "undefined"
      // and potentially overwrite the `children` prop
      children = []
    }

    properties = properties ? Object.assign({}, properties) : {}

    // Supported nested dataset attributes
    if (properties.dataset) {
      Object.keys(properties.dataset).forEach(function unnest(attrName) {
        var dashedAttr = attrName.replace(/([a-z])([A-Z])/, function dash(match) {
          return match[0] + '-' + match[1].toLowerCase()
        })
        properties['data-' + dashedAttr] = properties.dataset[attrName]
      })
    }

    // Support nested attributes
    if (properties.attributes) {
      Object.keys(properties.attributes).forEach(function unnest(attrName) {
        properties[attrName] = properties.attributes[attrName]
      })
    }

    // When a selector, parse the tag name and fill out the properties object
    if (typeof componentOrTag === 'string') {
      componentOrTag = parseTag(componentOrTag, properties)
    }

    // Create the element
    let args = [componentOrTag, properties].concat(children)

    return React.createElement.apply(React, args)
  }
})()
