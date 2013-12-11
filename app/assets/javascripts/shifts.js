function renderShiftsCalendar() {
    var day = d3.time.format( '%-d' ),
        weekday = d3.time.format( '%w' ),
        week = d3.time.format( '%U' ),
        hour = d3.time.format( '%H' ),
        month = d3.time.format( '%B' ),
        year = d3.time.format( '%Y' ),
        monthNumber = d3.time.format( '%m' ),
        percent = d3.format( '.1%' ),
        format = d3.time.format( '%Y-%m-%d' )
    
    var url = window.location.pathname
    url = ( url.length <= 1 ? '/shifts/open' : url )
    if( url == '/shifts' || url == '/shifts/open' ) {
        d3.json( '/tasks.json', function( error, tasks ) {
            var newTasks = {}
            tasks.forEach( function( t ) { newTasks[t.id] = t } )
            tasks = newTasks
            
            d3.json( url + '.json', function( error, shifts ) {
                for( var i = 0; i < shifts.length; i++ ) {
                    shifts[i].start = new Date( Date.parse(shifts[i].start ) )
                    shifts[i].end = new Date( Date.parse(shifts[i].end ) )
                }
                
                var start = new Date( d3.min( shifts, function( d ) { return d.start } ) )
                var end = new Date( d3.max( shifts, function( d ) { return d.end } ) )
                
                start.setDate( start.getDate() - 7 ) // Range is exclusive
                
                var weeks = d3.select( '#shifts' ).selectAll('.week')
                    .data( function( d ) { return d3.time.weeks( start, end ) } )
                    .enter()
                    .append( 'div' )
                    .attr( {
                        class: 'week',
                        week: week,
                        month: monthNumber,
                        year: year,
                    } )
            
                var weekBounds = d3.nest()
                    .key( function( d ) { return week( d.start ) } )
                    .rollup( function( d ) {
                        return {
                            start: d3.min( d, function( d ) { return d.start.getHours() } ),
                            end: d3.max( d, function( d ) { return d.end.getHours() } ),
                        }
                    } )
                    .map( shifts )
                
                var hoursForDay = function( d ) {
                    var start = new Date( d ),
                    end = new Date( d )
                    start.setHours( weekBounds[week( d )].start )
                    end.setHours( weekBounds[week( d )].end )
                    
                    return d3.time.hours( start, end )
                }
                
                var legends = weeks
                    .append( 'ol' )
                    .attr( {
                        class: 'legend',
                        hour: hour
                    } )
                
                legends
                    .filter( function( d ) { return week( d ) in weekBounds } )
                    .selectAll( '.legend' )
                    .data( hoursForDay )
                    .enter()
                    .append( 'li' )
                    .attr( {
                        class: 'hour',
                        hour: hour
                    } )
                    .text( function( d ) { return hour( d ) + "–" + ( parseInt( hour( d ) ) + 1 ) + ":00" } )
                
                
                var days = weeks.selectAll( '.day' )
                    .data( function( d ) {
                        var end = new Date( d )
                        end.setDate( d.getDate() + 7 )
                        return d3.time.days( d, end )
                    } )
                    .enter()
                    .append( 'div' )
                    .attr( {
                        class: 'day',
                        day: day,
                        weekday: weekday
                    } )
                
                weeks.filter( function( d, i ) {
                    var nextWeek = new Date( d )
                    nextWeek.setDate( d.getDate() + 7 )
                    return i == 0 || ( month( d ) != month( nextWeek ) )
                } )
                    .append( 'div' )
                    .classed( 'month title', true )
                    .text( function( d ) {
                        var nextWeek = new Date( d )
                        nextWeek.setDate( d.getDate() + 7 )
                        return month( nextWeek )
                    } )
                
                
                var titles = days
                    .append( 'div' )
                    .attr( {
                        class: 'title',
                    } )
                    .text( day )
                
                var hours = days
                    .filter( function( d ) { return week( d ) in weekBounds } )
                    .selectAll( '.hour' )
                    .data( hoursForDay )
                    .enter()
                    .append( 'ol' )
                    .attr( {
                        class: 'hour',
                        hour: hour
                    } )
                
                
                var shiftStarts = d3.nest()
                    .key( function( d ) { return d.start } )
                    .rollup( function( d ) { return d } )
                    .map( shifts )
                
                var shifts = hours.filter( function( d ) { return d in shiftStarts } )
                    .classed( 'open', true )
                    .selectAll( '.shift' )
                    .data( function( d ) { return shiftStarts[d] } )
                    .enter()
                    .append( 'li' )
                    .attr( {
                        class: 'shift'
                    } )
                    .classed( 'taken', function( d ) { return d.taken } )
                    .on( 'dblclick', function( d ) { window.location = d.url } )
                    .append( 'label' )
                
                shifts
                    .append( 'input' )
                    .attr( {
                        type: 'radio',
                        name: function( d ) { return 'shift[' + d.start + ']' } 
                    } )
                
                shifts
                    .append( 'img' )
                    .classed( 'icon', true )
                    .attr( {
                        src: function( d ) { return tasks[d.task_id] ? tasks[d.task_id].icon : null }
                    } )
                
                $(document).trigger( 'shifts:loaded' )
                
                return
                
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
                    .classed( 'taken', function( d ) { return d.taken } )
                    .on( "click", function( d ) {
                        if( d3.select( this.parentNode ).selectAll( '.icon.taken' ).size() > 0 ) {
                            return
                        }
                        if( d.needed <= 0 ) {
                            return
                        }
                        var selected = d3.select( this ).classed( 'selected' )
                        d3.select( this.parentNode ).selectAll( '.icon' ).classed( 'selected', false )
                        if( ! selected ) {
                            d3.select( this ).classed( 'selected', true )
                        }
                        $(document).trigger( 'selection-changed' )
                    } )
                    .on( "dblclick", function( d ) {
                        window.location = d.url
                    })
                
                icons
                    .append( 'title' )
                    .text( function( d ) {
                        var name = tasks[d.task_id] ? tasks[d.task_id].name : 'Unknown Type'
                        return name + " from " + hour(d.start) + " to " + hour(d.end) + " (×" + d.needed + ")"
                    } )
                
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
    }
}

// Load on turbolinks page change
$(document).on( 'page:load', renderShiftsCalendar )
$(document).ready( renderShiftsCalendar )

$(document).on( 'shifts:loaded', function() {
    $('#take-shifts')
        .click( function() {
            var selected = d3.selectAll( 'input:checked' )
                .map( function( selection ) {
                    return selection.map( function( d ) {
                        return d3.select( d ).data()[0]
                    } )
                } )[0]
            var ids = selected.map( function( d ) { return d.id } )
            var $form = $('#shifts-form form')
            ids.forEach( function( id ) {
                $form.append( $('<input/>')
                              .attr( { name: 'shift_ids[]' } )
                              .val( id )
                            )
            } )
            if( ids.length > 0 ) {
                $form.submit()
            }
        } )

    // Disable hours where a shift is taken
    $('.taken').parent()
        .addClass( 'taken' )
        .find( 'input' ).attr( { disabled: true } )

    // Allow unselecting shifts
    $('label').click( function( event ) { 
        event.preventDefault()
        var $input = $(this).find('input');
        if( ! $input.prop( 'disabled' ) && ! $input.prop( 'checked' ) ) {
            $input.prop( { checked: true } )
        } else {
            $input.prop( { checked: false } )
        }
    } )

    $('.hour')
        .mouseover( function() {
            $(this).parents( '.week' ).find( ".hour[hour='" + $(this).attr( 'hour' ) + "']" ).attr( { hovered: true } )
        } )
        .mouseout( function() {
            $(this).parents( '.week' ).find( '.hour' ).attr( { hovered: null } )
        } )
} )

$.fn.datepicker.defaults.format = 'yyyy/m/d'

;( function( i, s, o, g, r, a, m ) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push( arguments )
    }
    i[r].l = 1 * new Date()
    a = s.createElement( o )
    m = s.getElementsByTagName( o )[0]
    a.async = 1
    a.src = g
    m.parentNode.insertBefore( a, m )
} )( window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga' )

ga('create', 'UA-46155649-1', 'vols.herokuapp.com');
ga('send', 'pageview');
