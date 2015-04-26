$(function() {
	$( "#slider" ).slider({
	  value:100,
	  min: 100,
	  max: 1000,
	  step: 5,
	  slide: function( event, ui ) {
	    $( "#range" ).html( ui.value + 'm');
	  }
	});
	$( "#range" ).html( $( "#slider" ).slider( "value" ) + 'm' );
});

