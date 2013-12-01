class ShiftsController < ApplicationController
  before_action :set_shift, only: [:show, :edit, :update, :destroy]
  before_filter :authenticate_user!, except: [:index, :show]

  # GET /shifts
  # GET /shifts.json
  def index
    @shifts = Shift.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @shifts }
      format.ics  { render :text => self.generate_ical }
      format.json
    end
  end

  def open
    @shifts = Shift.all.select{ |s| s.needed > 0 }

    respond_to do |format|
      format.html { render :index }
      format.xml  { render :xml => @shifts }
      format.ics  { render :text => self.generate_ical }
      format.json { render :index }
    end
  end

  # GET /shifts/1
  # GET /shifts/1.json
  def show
  end

  # GET /shifts/new
  def new
    @shift = Shift.new
  end

  # GET /shifts/1/edit
  def edit
  end

  # POST /shifts
  # POST /shifts.json
  def create
    @shift = Shift.new(shift_params)

    respond_to do |format|
      if @shift.save
        format.html { redirect_to @shift, notice: 'Shift was successfully created.' }
        format.json { render action: 'show', status: :created, location: @shift }
      else
        format.html { render action: 'new' }
        format.json { render json: @shift.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /shifts/1
  # PATCH/PUT /shifts/1.json
  def update
    respond_to do |format|
      if @shift.update(shift_params)
        format.html { redirect_to @shift, notice: 'Shift was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @shift.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /shifts/1
  # DELETE /shifts/1.json
  def destroy
    @shift.destroy
    respond_to do |format|
      format.html { redirect_to shifts_url }
      format.json { head :no_content }
    end
  end

  def take
    puts params[:worker_ids]
  end

  def generate_ical
    cal = Icalendar::Calendar.new
    @shifts.each do |shift|
      # create the event for this tool
      event = Icalendar::Event.new
      event.start = shift.start.strftime("%Y%m%dT%H%M%S")
      event.end = shift.end.strftime("%Y%m%dT%H%M%S")
      event.summary = shift.task.name if shift.task
      event.uid = shift_url(shift)
      
      # insert the event into the calendar
      cal.add event
    end
    
    # return the calendar as a string
    cal.to_ical
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_shift
      @shift = Shift.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def shift_params
      params.require(:shift).permit(:start, :end, :size, :workers, :task_id)
    end
end
