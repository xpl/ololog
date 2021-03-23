const input = document.getElementById ('foo')

input.onkeydown = function (e) {
  if (e.keyCode === 13) {
    foo ()
  }
}
input.oninput = foo

function foo () {
  try {
    eval (input.value)
    input.className = ''
  } catch (e) {
    console.log (e)
    input.className = 'err'
  }
}

foo ()