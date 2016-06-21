// Declare the Core library for use outside of the app object
var Core = Core;

// Define lastLength; variable to be used to remember the last length of students
var lastLength = 0;

// searchStudents is attached to both the click and keyup events for the search bar
function searchStudents() {
    	// searchText is the search input's value
	var searchText = this.parentElement.childNodes[0].value;
    	// if the length of searchText is greater than 0, execute the app.init function
	if (searchText.length > 0) {
    		// trim any whitespace from the searchText
		app.init(String(searchText.trim()));
    	// else, run app.init to get the default values that are in place when the program boots
	} else {
		app.init();
	}
}

// animate is used for the simple fadeIn animation; takes two parameters, add and studenList
function animate(studentList, add) {
    	// add controls the opacity, so it is incremented by a small amount each time the function is run
	add += 0.01;
    	// if studentList's (the actual studentList UL) opacity is greater than one, the function terminates
	if (studentList.style.opacity >= 1) {
		return 0;
    	// else, a setTimeout is created and the function is run until opacity is greater than one
	} else {
		setTimeout(function() { animate(studentList, add); }, 0.2);
	}
    	// if nothing is returned, opacity becomes the value of add
	studentList.style.opacity = add;
}

// an anonymous self executing function that uses the module pattern
var app = (function(_) {
// _ is used in place of the Core library for shorthand purposes
	
	// A function that determines the total pages needed by dividing students.length by 10
	var ceil = function(students) {
		return Math.ceil(students.length / 10);
	};
	
    	// preservedStudents is a preserved version of the student items; this is never modified
	var preservedStudents = _.getElementsByClass("student-item");
    	// an empty students array variable used for the modification of preservedStudents
	var students = [];
    	// the div with the class of page
	var page = _.getElementsByClass("page")[0];
    	// the totalPages needed for pagination
	var totalPages = ceil(students);
  
	// the public API that you can use with app  
	return {
		
		// the initialize function that controls the execution of all necessary functions
		init: function(search) {
        		// search is the searchText value mentioned earlier; it's passed into modifyStudents
			this.modifyStudents(search);
        		// the showStudents function is then called to handle the actual display of students
			this.showStudents();
		},
		
		// the modifyStudents function that receives the search parameter AKA searchText
		modifyStudents: function(search) {
			
			// a list of special characters used as a RegExp to detect if special characters are
			// used in the searchText
			var specials = !/[~`!#$%\^&*+=\-\\(\)[\]\\';,/{}|\\":<>\?]/g.test(search);
			// an empty array variable that is used as a liason between preservedStudents and students
			var newStudents = [];
			// studentName and studentEmail are used to store both the student name and e-mail
			var studentName, studentEmail;
			
		    	// check to see if search is undefined
			if (search !== undefined) {
			// if not, create var test: this is used to store the results of the RegExp
				var test;
				// check to see if special characters are detected
				if (specials) {
				// if they aren't, create a RegExp from search
					test = new RegExp(search, 'i');
				} else {
				// otherwise, set the search input value back to "", and create a RegExp that
				// returns the default student values
					document.getElementsByTagName('input')[0].value = "";
					test = new RegExp('x', 'i');
				}
				
                		// iterate over preservedStudents, find if studentName or studentEmail match the search input
				for (var i = 0; i < preservedStudents.length; i++) {
					studentName = preservedStudents[i].children[0].children[1].innerHTML;
					studentEmail = preservedStudents[i].children[0].children[2].innerHTML;
					if (test.exec(studentName) || test.exec(studentEmail)) {
					// if a match is found, push that student object into the newStudents array
						newStudents.push(preservedStudents[i]);
						
					}
				}
				
			} else {
			// else, set the value of newStudents to preservedStudents
				newStudents = preservedStudents;
				
			}
			
		    	// set students equal to newStudents
			students = newStudents;
            		// get the total number of pages for the students array
			totalPages = ceil(students);
		},
	
	    	// showStudents function responsible for calling functions that actually display the students   
		showStudents: function() {
			// create the studentList, pagination, and noResults variables
			var studentList, pagination, noResults;
			// get the current length of students
			var currentLength = students.length;
			
			// each try catch block acts as a means to check if the html object exists; if it does, then it removes it, else
			// nothing happens
			try {
				studentList = _.getElementsByClass('student-list')[0];
				page.removeChild(studentList);
			} catch (err) {}
			
			try {
				pagination = _.getElementsByClass('pagination')[0];
				page.removeChild(pagination);
			} catch (err) {}
			
			try {
				noResults = _.getElementsByClass('no-results')[0];
				page.removeChild(noResults);
			} catch (err) {}
		    
			// if students length is equal to zero, that means there are no results to display, call returnNoResults to return
			// the "No Results Found" text
			if (students.length === 0) {
				return app.returnNoResults();
			}
			
			// if students.length isn't equal to zero, there are results to display, create a UL, add the class of 'student-list'
			// to it, then find which students to display based off of the start value
			var studentUL = document.createElement("UL");
			_.addClass(studentUL, "student-list");
			// the start value is determined by looking at the innerHTML of the anchor element that was clicked, subtracting
			// 1 and multiplying that by 10
			var start = (parseInt(this.innerHTML) - 1) * 10;
			// this if block is used in the case that the program is initially booted. if start isNaN, it's safe to assume that 
			// no link has been clicked, so it just displays the first ten students
			if (isNaN(start)) {
				start = 0;
			}
			
			// end is determined by looking at start and adding 9. if students 1 - 10 need to be displayed, that means it needs 
			// to access index 0 - 9, 10 - 19, etc. 
			var end = start + 9;
			// if end is greater than students.length, it means that the user is nearing the end of the students list, so it's safe 
			// to assume that only the very last set of students needs to be displayed
			if (end > students.length) {
				end = students.length - 1;
			}
			// iterate over students, if the index of i is greater than or equal to start, and less than or equal to end, append that 
			// student object to the studentUL
			for (var i = 0; i < students.length; i++) {
				if (i >= start && i <= end) {
					studentUL.appendChild(students[i]);
				}
			}
			
			// all of the students have been appended to the studentUL, it can append it to the page now
			page.appendChild(studentUL);
			// create the appropriate amount of page links for the pagination div
			app.createPageLinks();
			// add the anchor event listeners
			app.addAnchorListeners();
			
			// set the lastLength variable equal to zero if one of the "A" elements is clicked
			// I do this because, technically, lastLength and currentLength will always be equal when page
			// flips occur. I want the animation effect to activate on each click
			if (this.nodeName === "A") {
				lastLength = 0;
			}
			
			// set studentList equal to the class 'student-list'
			studentList = _.getElementsByClass('student-list')[0];
			
			// check to see if currentLength is not equal to lastLength
			if (currentLength !== lastLength) {
				// if that's the case, set studentList's opacity to 0 (initial value for animation)
				studentList.style.opacity = 0;
				// call the animate function to fadeIn the div
				animate(studentList, 0.01);
			}
			
			// set the lastLength equal to the current students.length;
			lastLength = students.length;
			
			// get all 'a' elements
			var hyperlink = document.getElementsByTagName('a');
			// pass this.innerHTML and the hyperlink collection into the appendToActiveHyperlink function
			app.appendActiveToHyperlink(this.innerHTML, hyperlink);
			
		},
		
		// appendActiveToHyperlink takes two parameters, e, and hyperlink
		appendActiveToHyperlink: function(e, hyperlink) {
			// hyperlink is a collection of html 'a' elements
			for (var lnk in hyperlink) {
				// iterate through each hyperlink element
				if (hyperlink[lnk].innerHTML == e) {
				// if the current hyperlink's innerHTML is equal to e (this.innerHTML), append the class active to that object
					_.addClass(hyperlink[lnk], 'active');
				} else if (e === undefined) {
				// else if e is equal to undefined, it's safe to assume that the page has just been loaded, so one would be the 
				// page that is selected; append the class active to one then return 0 to break the function
					_.addClass(hyperlink[lnk], 'active');
					return 0;
				}
			}
		},
		
		// returnNoResults takes no parameters and is called when students.length is equal to zero
		returnNoResults: function() {
			// notification is an H2 html element
			var notification = document.createElement("H2");
			// add the class "no-results" to notification
			_.addClass(notification, "no-results");
			// alter the innerHTML of notification and set it to "No results found";
			notification.innerHTML = "No results found";
			// append this as a child to notification
			page.appendChild(notification);
			// return 0 to break out of the function
			return 0;
		},
	
		
		// appendSearchBar is called once to append the search bar to the page
		appendSearchBar: function() {
			
			// find the page-header class
			var pageHeader = _.getElementsByClass("page-header")[0];
			// create a div for the search bar
			var searchBarDiv = document.createElement("DIV");
			// create an input for the search input
			var searchInput = document.createElement("INPUT");
			// create a button for the search button
			var searchButton = document.createElement("BUTTON");
			// set the HTML of the searchButton so it reads "Search"
			searchButton.innerHTML = "Search";
			// set a default value for the searchInput
			searchInput.placeholder = "Search for students...";
			// append the searchInput to the searchBarDiv
			searchBarDiv.appendChild(searchInput);
			// append the searchButton to the searchBarDiv
			searchBarDiv.appendChild(searchButton);
			// add the class of 'student-search' to searchBarDiv
			_.addClass(searchBarDiv, "student-search");
			// append the searchBarDiv to the pageHeader
			pageHeader.appendChild(searchBarDiv);
			
		},
		
		// createPageLinks is responsible for creating the page links in the pagination div
		createPageLinks: function() {
			
			// create a DIV element for the pagination div
			var paginationDiv = document.createElement("DIV");
			// create a UL that will be used for the pagination links
			var paginationList = document.createElement("UL");
			// add the class of 'pagination' to the pagination div
			_.addClass(paginationDiv, "pagination");
			// if the totalPages variable is equal to one, there is no more than one page -- don't create page links
			if (totalPages === 1) { return 0; }
			// iterate over the totalPages variable
			for (var i = 1; i <= totalPages; i++) {
				// for each instance of i, create an LI element that will hold the "A" element
				var pageLinkContainer = document.createElement("LI");
				// create the "A" element
				var pageLink = document.createElement("A");
				// set each "A"'s values to "#"
				pageLink.href = "#";
				// set the innerHTML equal to the value of i (1, 2, 3, 4, 5, etc)
				pageLink.innerHTML = i;
				// append the pageLink to the pageLinkContainer
				pageLinkContainer.appendChild(pageLink);
				// finally append the pageLinkContainer to the paginationList
				paginationList.appendChild(pageLinkContainer);
			}
			
			// append the paginationList to the paginationDiv
			paginationDiv.appendChild(paginationList);
			// append everything to the page
			_.getElementsByClass('page')[0].appendChild(paginationDiv);
		},
		
		// used to add anchor event listeners to the 'a' elements
		addAnchorListeners: function() {
	  // create the paginationDiv variable to contain the pagination div	
      var paginationDiv;
            // try catch block to see if there are any childNodes to iterate over, if there aren't any, return 0 to break out of 
			// this function
			try { 
				paginationDiv = _.getElementsByClass("pagination")[0].childNodes;
			} catch (err) {
				return 0;
			}
			
			// get the childNodes of the LI elements; these are the links
			var links = paginationDiv[0].childNodes;
			// iterate over each link in links
			for (var link in links) {
		// if link exists proceed
        if (link) {
		  // set the target value equal to the current links lastChild
          var target = links[link].lastChild;
		  // if the target is not equal to undefined, attach the click event handler and bind the showStudents method
          if (target !== undefined) {
            _.addEventListener(target, 'click', this.showStudents);
          } else {
		  // continue otherwise
            continue;
          }
        }
			}
		},
	
	};
	
}(Core));

// initialize the app
app.init();
// append the search bar
app.appendSearchBar();
// attach the event handlers for the search functions
Core.addEventListener(document.getElementsByTagName('button')[0], 'click', searchStudents);
Core.addEventListener(document.getElementsByTagName('input')[0], 'keyup', searchStudents);
