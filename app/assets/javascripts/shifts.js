function renderShiftsCalendar() {
    var width = window.innerWidth,
        cellSize = width / 8,
        height = cellSize * 53.75,
        position = {
            x: (width - cellSize * 7) / 2,
            y: cellSize * .75
        }
    
    var day = d3.time.format("%w"),
        week = d3.time.format("%U"),
        month = d3.time.format("%B"),
        percent = d3.format(".1%"),
        format = d3.time.format("%Y-%m-%d")
    
    var displayDay = {
        start: 9, // Start hour for block
        end: 14 // End hour
    },
        shiftPadding = cellSize * .02,
        iconPadding = cellSize * .02 
    
    var svg = d3.select("#shifts").selectAll("svg")
        .data(d3.range(2013, 2015))
        .enter().append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "none")
        .attr("width", "100%")
        .attr("height", height * .9) // eyeballing
        .append("g")
        .attr("transform", "translate(" + position.x + "," + position.y + ")")
    
    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + "," + (-cellSize / 5) + ")")
        .style("text-anchor", "middle")
        .text(function(d) { return d })
    
    var days = svg.selectAll(".day")
        .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)) })
        .enter().append("rect")
        .attr("class", "day")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", function(d) { return day(d) * cellSize })
        .attr("y", function(d) { return week(d) * cellSize })
        .datum(format)
    
    days.append("title")
        .text(function(d) { return d })
    
    function monthPath(t0) {
        var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = +day(t0), w0 = +week(t0),
        d1 = +day(t1), w1 = +week(t1)
        return "M" + d0 * cellSize + "," + (w0 + 1) * cellSize
          + " V" + w0 * cellSize + " H" + 7 * cellSize
            + " V" + w1 * cellSize + " H" + (d1 + 1) * cellSize
            + " V" + (w1 + 1) * cellSize + " H" + 0
            + " V" + (w0 + 1) * cellSize + " Z"
    }
    
    var months = function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)) }
    
    svg.selectAll(".month")
        .data(months)
        .enter().append("path")
        .attr("class", "month")
        .attr("d", monthPath)
    
    svg.selectAll(".label")
        .data(months)
        .enter().append("text")
        .attr("class", "label")
        .attr("transform", function(month) {
            return "translate(" + (7 * cellSize) + "," + (week(month) * cellSize) + ")rotate(90)"
        } )
        .text(month)
    
    d3.json( '/tasks.json', function( error, tasks ) {
        var newTasks = {}
        tasks.forEach( function( t ) { newTasks[t.id] = t } )
        tasks = newTasks
    
        d3.json( window.location.pathname + '.json', function( error, shifts ) {
            for( var i = 0; i < shifts.length; i++ ) {
                shifts[i].start = new Date( Date.parse(shifts[i].start ) )
                shifts[i].end = new Date( Date.parse(shifts[i].end ) )
                shifts[i].day = {
                    start: new Date(
                        shifts[i].start.getFullYear(),
                        shifts[i].start.getMonth(),
                        shifts[i].start.getDate(),
                        displayDay.start
                    ),
                    end: new Date(
                        shifts[i].start.getFullYear(),
                        shifts[i].start.getMonth(),
                        shifts[i].start.getDate(),
                        displayDay.end
                    ),
                }
            }
            
            // ToDo: Investigate scales for this computation: http://alignedleft.com/tutorials/d3/scales
            function shiftHeight(shift) {
                var dayLength = shift.day.end.getTime() - shift.day.start.getTime(),
                factor = cellSize / dayLength, // px/ms
                shiftLength = shift.end.getTime() - shift.start.getTime()
                return shiftLength * factor
            }
            
            function shiftOffset(shift) {
                var dayOffset = week(shift.start) * cellSize,
                dayLength = shift.day.end.getTime() - shift.day.start.getTime(),
                factor = cellSize / dayLength, // px/ms
                shiftOffset = shift.start.getTime() - shift.day.start.getTime()
                return dayOffset + shiftOffset * factor
            }

            var nestedShifts = d3.nest()
                .key(function(d) { return d.start.getTime() + "+" + (d.end.getTime() - d.start.getTime()) })
                .entries(shifts)
            
            function iconWidth(d) {
                return shiftHeight(d) * .9
            }
            
            var shifts = svg.selectAll(".shift")
                .data(nestedShifts)
                .enter()
                .append("g")
                .attr( {
                    class: 'shift',
                    transform: function( d ) {
                        return (
                            "translate("
                            + day( d.values[0].start ) * cellSize
                            + ","
                            + shiftOffset( d.values[0] )
                            + ")"
                        )
                    }
                } )
            
            shifts
                .append("rect")
                .attr( {
                    class: 'shift',
                    width: cellSize,
                    height: function( d ) { return shiftHeight( d.values[0] ) },
                    x: 0,
                    y: 0,
                } )

            var icons = shifts.selectAll(".icon")
                .data( function( d ) { return d.values } )
                .enter()
                .append( "g" )
                .attr( {
                    class: 'icon',
                    transform: function( d, i ) {
                        return (
                            "translate("
                            + (i * iconWidth( d ) * 1.1 + shiftPadding)
                            + ","
                            + shiftPadding
                            + ")"
                        )
                    }
                } )
                .on( "click", function() {
                    var selected = d3.select( this ).attr( "class" ).match( /selected/ )
                    d3.select( this.parentNode ).selectAll( ".icon" ).attr( "class", "icon" )
                    if( ! selected ) {
                        d3.select( this ).attr( "class", "icon selected" )
                    }
                } )
                .on( "dblclick", function( d ) {
                    window.location = d.url
                })

            icons
                .append( 'title' )
                .text( function( d ) { return tasks[d.task_id] ? tasks[d.task_id].name : 'Unknown Type' } )

            icons
                .append("rect")
                .attr( {
                    class: 'icon bg',
                    width: iconWidth,
                    height: function( d ) { return shiftHeight( d ) - shiftPadding * 2 },
                    x: 0,
                    y: 0,
                    rx: 5,
                    ry: 5,
                } )

            icons
                .append("svg:image")
                .attr( {
                    "xlink:href": function( d ) { return tasks[d.task_id] ? tasks[d.task_id].icon : null },
                    width: function( d ) { return iconWidth( d ) - iconPadding * 2 },
                    height: function( d ) { return shiftHeight( d ) - iconPadding * 2 - shiftPadding * 2 },
                    x: iconPadding,
                    y: iconPadding,
                } )
        } )
    } )
    setTimeout( function() {
        window.scrollTo( 0, week( new Date() ) * cellSize * .93 )
    }, 10 )
}

// Load on turbolinks page change
$(document).on( 'page:load', renderShiftsCalendar )
$(document).ready( renderShiftsCalendar )

function tasksAddListener() {
    $('#take-shifts').click( function() {
        var selected = d3.selectAll( '.icon.selected' )
            .map( function( selection ) {
                return selection.map( function( d ) {
                    return d3.select( d ).data()[0]
                } )
            } )[0]
        var ids = selected.map( function( d ) { return d.id } )
        $('input[name="worker_ids[]"]')
            .val( ids.join( ',' ) )
            .parents( 'form' )
            .submit()
    } )
}

$(document).on( 'page:load', tasksAddListener )
$(document).ready( tasksAddListener )
