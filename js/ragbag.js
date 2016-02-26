;(function(window, undefined){
  var ragbag = window.ragbag = {};

  ragbag.noop = function() {};

  function mutate(tomutate){
    return tomutate + 'mutated';
  };

  function reverseify(toreverse){
    var reversed = toreverse.split('').reverse().join('');
    return reversed;
  }

  function zErrors(input) {
    if (input.indexOf('z') !== -1) {
      input.nosuchmethod();
    }
  }

  function catcheryserator(input){
    if (input.indexOf('x') !== -1) {
      try {
        input.nosuchmethod();
      } catch (e) {
        // Lazybones does nothing
      }
    }
  }

  ragbag.tryme = function(input) {
    var output = input;
    var nonsense_context = 'nonsense';
    // Step over me
    var output = mutate(output);
    // step into me then step out
    var output = reverseify(output);

    // conditional breakpoint?
    contextualNonsensificator();

    // Adjust output to have a z and enable pause on uncaught
    zErrors(output);

    // Adjust output to have an x and enable pause on caught
    catcheryserator(output);

    return output;

    // Hoisting horror.
    function contextualNonsensificator(){
      // add a conditional breakpoint here if the output contains 'br'
      var temp = output + nonsense_context;
      // Please remind RUPERT to talk a bit about scopes here
      output = temp;
    };
  };

})(window);
