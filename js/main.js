var current_puzzle = "";
var current_puzzle_description = "";

function isSolved(puzzle){
	if(localStorage.solvedPuzzles){
		var puzzles = JSON.parse(localStorage.solvedPuzzles);
		if(puzzles){
			return $.inArray(puzzle, puzzles) !== -1;
		}
	}
	return false;
}
function solve(puzzle){
	var puzzles = [];
	if(localStorage.solvedPuzzles){
		puzzles = JSON.parse(localStorage.solvedPuzzles);
	}
	puzzles.push(puzzle);
	localStorage.solvedPuzzles = JSON.stringify(puzzles);
}
function refreshPuzzles(){
	$.get('js/ducross/puzzles.json', function(json){
		var string = "";
		var puzzle_number = 1;
		$.each(json, function(key, value){
			string += "<div class=\"puzzle-column\"><h1>"+value.name+"</h1>";
			string += "<ul>";
			$.each(value.puzzles, function(key, value){
				var name = "???";
				if(isSolved(value[0])){
					name = value[1];
				}
				string += '<li><a class="puzzle" data-puzzle-name="'+value[0]+'" data-puzzle-description="'+value[1]+'" href="#">Puzzle '+puzzle_number+': '+name+'</a></li>';
				puzzle_number++;
			});
			string += "</ul></div>";
		});
		string += '<br style="clear:both;" />';
		$('#puzzle-selector').html(string);
		$('.puzzle').click(function(){
			current_puzzle = $(this).data("puzzle-name");
			current_puzzle_description = $(this).data("puzzle-description");
			$('#picross_wrapper').show();
			$('#puzzle').html("");
			ducross = new Ducross();
			ducross.puzzleLocation = "js/ducross/puzzles/";
			ducross.mode = 0;
			$('#mode').html("Mode (draw)");
			ducross.finishCallback = function(){
				solve(current_puzzle);
				$().tostie({type: "success", message: "You've successfully solved the puzzle.<br />Solution: <strong>"+current_puzzle_description+"</strong>."});
				setTimeout(function(){
					if(!$('#puzzle-selector').is(":visible")){
						showPuzzles();
					}
				}, 3000);
			};
			ducross.loadPuzzle(current_puzzle);
			ducross.drawPuzzle();
			showPuzzle();
			return false;
		});
	});
}
function showPuzzles(){
	refreshPuzzles();
	$('.tab').hide(200, function(){$('#puzzle-selector').show(200)});
}
function showPuzzle(){
	$('.tab').hide(200, function(){$('#puzzle-field').show(200)});
}

$(document).ready(function(){
	refreshPuzzles();
	$('#back-to-menu').click(function(){
		showPuzzles();
	});
	window.addEventListener('contextmenu', function(ev) {
		ev.preventDefault();
		$('#mode').click();
		return false;
	}, false);
});