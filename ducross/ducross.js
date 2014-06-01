function Ducross(){
	this.totalWidth = 0;
	this.totalHeight = 0;
	this.boxSize = 30;
	this.puzzle = [];
	//0 = drawing, 1 = exclude
	this.mode = 0;
	this.touch = false
	this.isDown = false;
	this.puzzleLocation;
	//0 is regular play, 1 is generate
	this.playMode = 0;
	//Add some listeners
	this.hookEventListeners = function(){
		var ducross = this;
		$(document).mousedown(function() {
			ducross.isDown = true;      // When mouse goes down, set isDown to true
		})
		.mouseup(function() {
			ducross.isDown = false;    // When mouse goes up, set isDown to false
		});

		//Box action
		if('ontouchstart' in window){
			$('.box').bind('touchstart', function(e) {
				if(!this.touch){
					this.touch = true;
					ducross.boxAction($(this));
				}
			});
			$('.box').bind('touchend', function(e) {
				this.touch = false;
			});
		}
		else{
			$('.box').mousedown(function(){
				ducross.boxAction($(this));
			});
			$('.box').mouseover(function(){
				if(ducross.isDown){
					ducross.boxAction($(this));
				}
			});
		}
		$('#mode').click(function(){
			ducross.switchMode();
			return false;
		});
		$(document).dblclick(function(e){
			ducross.switchMode();
		});
		
		$('#generate').click(function(){
			var id;
			var result = [];
			var parts;
			var x;
			var y;
			var json = {};
			$('.box').each(function(){
				id = $(this).attr("id");
				parts = id.split("_");
				x = parseInt(parts[0]);
				y = parseInt(parts[1]);
				if(!result[x]){
					result[x] = [];
				}
				result[x][y] = $(this).hasClass("active");
			});
			json.puzzle = result;
			$('#result').val(JSON.stringify(json));
		});
	};
	//Loads a puzzle from the "puzzles" directory
	this.loadPuzzle = function(puzzle_name){
		var width;
		var height;
		var result;
		$.ajax({
			type: 'GET',
			url: this.puzzleLocation+puzzle_name+'.json',
			success:function(json){
				result = json;
				height = json.puzzle.length;
			},
			async:false
		});
		this.totalWidth = result.puzzle[0].length;
		this.totalHeight = height;
		this.puzzle = result.puzzle;
	};
	//Draws the actual puzzle
	this.drawPuzzle = function(){
		var result = "";
		
		if(this.playMode == 0){
			//Hints
			var horizontal_hints = this.getHorizontalHints();
			var vertical_hints = this.getVerticalHints();
			
			var hintPx = this.boxSize+1;
			result += '<div class="horizontal-numbers">';
			for(i=0;i<horizontal_hints.length;i++){
				result += '<div class="row" style="height:'+hintPx+'px;line-height:'+(hintPx-4)+'px;">';
				result += horizontal_hints[i].join(" ");
				result += '</div>';
			}
			result += '</div>';
			
			result += '<div class="vertical-numbers">';
			for(i=0;i<vertical_hints.length;i++){
				result += '<div class="row" style="width:'+hintPx+'px;text-align:center;">';
				result += vertical_hints[i].join("<br />");
				result += '</div>';
			}
			result += '</div>';
		}
		
		//Puzzle grid
		var gridWidthPx = (this.boxSize+2)*this.totalWidth;
		var gridHeightPx = (this.boxSize+2)*this.totalHeight;
		result += '<div class="grid" style="width:'+gridWidthPx+'px;height:'+gridHeightPx+'px;;">';
		for(i=0;i<this.totalHeight;i++){
			result += '<div class="row">';
			for(y=0;y<this.totalWidth;y++){
				result += '<div class="box" id="'+i+'_'+y+'" style="width:'+this.boxSize+'px;height:'+this.boxSize+'px;"></div>';
			}
			result += '</div>';
		}
		result += '</div>';
		
		var widthPx = gridWidthPx;
		var heightPx = gridHeightPx;
		if(this.playMode == 0){
			widthPx += 131;
			heightPx += 131;
		}
		$('#puzzle').attr("style", "width:"+widthPx+"px;height:"+heightPx+"px");
		
		$('#puzzle').append(result);
		
		this.hookEventListeners();
	};
	//Fill an array with hints which should be shown on the side
	this.getHorizontalHints = function(){
		var result = [];
		var temp;
		var tempCounter = 0;
		for(i=0;i<this.totalHeight;i++){
			result[i] = [0];
			temp = this.puzzle[i];
			tempCounter = 0;
			for(y=0;y<temp.length;y++){
				if(temp[y] == true){
					if(!result[i][tempCounter]){
						result[i][tempCounter] = "0";
					}
					result[i][tempCounter] = (parseInt(result[i][tempCounter])+1)+"";
				}
				else{
					if(temp[y-1] == true){
						tempCounter++;
					}
				}
			}
		}
		return result;
	};
	//Fill an array with hints which should be shown on the top
	this.getVerticalHints = function(){
		var verticalArray = this.getVerticalArray();
		var result = [];
		var temp;
		var tempCounter = 0;
		for(i=0;i<this.totalWidth;i++){
			result[i] = ["0"];
			temp = verticalArray[i];
			tempCounter = 0;
			for(y=0;y<temp.length;y++){
				if(temp[y] == true){
					if(!result[i][tempCounter]){
						result[i][tempCounter] = 0;
					}
					result[i][tempCounter] = (parseInt(result[i][tempCounter])+1)+"";
				}
				else{
					if(temp[y-1] == true){
						tempCounter++;
					}
				}
			}
		}
		return result.reverse();
	};
	//Returns an array which is turned 90 degrees, so that the hints for the vertical rows can be generated
	this.getVerticalArray = function(){
		var result = [];
		var temp = [];
		for(i=0;i<this.totalWidth;i++){
			temp = [];
			for(y=0;y<this.totalHeight;y++){
				temp[y] = this.puzzle[y][i];
			}
			result[i] = temp;
		}
		return result;
	};
	//Returns true when the current state is the correct solution
	this.checkResult = function(){
		var element;
		for(i=0;i<this.totalWidth;i++){
			for(y=0;y<this.totalHeight;y++){
				element = $('#'+i+'_'+y);
				if(this.puzzle[i][y] != element.hasClass("active")){
					return false;
				}
			}
		}
		return true;
	};
	//A function which sets the status of a box
	this.boxAction = function(element){
		if(this.mode == 0){
			element.removeClass("excluded");
			if(!element.hasClass("active")){
				element.addClass("active");
			}
			else{
				element.removeClass("active");
			}
			/*if(this.playMode == 0){
				if(ducross.checkResult()){
					alert('You won!');
				}
			}*/
		}
		else{
			element.removeClass("active");
			if(!element.hasClass("excluded")){
				element.addClass("excluded");
			}
			else{
				element.removeClass("excluded");
			}
		}
	};
	//Switches the drawing mode
	this.switchMode = function(){
		if(this.mode == 0){
			$('#mode').html("Mode (exclude)");
			this.mode = 1;
		}
		else{
			$('#mode').html("Mode (draw)");
			this.mode = 0;
		}
	}
}