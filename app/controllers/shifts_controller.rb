class ShiftsController < ApplicationController
  # before_action :set_shift, only: [:show, :edit, :update, :destroy]
  before_filter :authenticate_user!, except: [:index, :show, :open]
  load_and_authorize_resource
  skip_authorize_resource only: [:open, :take, :taken]

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
    @shifts = Shift.all.select{ |s| s.needed > 0 || s.worker?(current_user) }

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
    @shifts = []
    if params[:worker_ids]
      params[:worker_ids].each do |id|
        shift = Shift.find(id)
        shift.workers << current_user
        @shifts << shift
      end
    end
  end

  def clone
  end

  def do_clone
    date_format = '%Y/%m/%d'
    from_start = DateTime.strptime( params[:from][:start], date_format )
    from_end = DateTime.strptime( params[:from][:end], date_format )
    to_start = DateTime.strptime( params[:to][:start], date_format )

    originals = Shift.where('start >= ? AND start <= ?', from_start, from_end)
    puts originals.count
    originals.each do |shift|
      puts 'To: ' + to_start.to_s
      puts 'From: ' + from_start.to_s
      puts 'Start: ' + shift.start.to_s
      puts (shift.start - from_start)
      puts to_start + (shift.start.to_datetime - from_start)
      new = shift.dup
      new.workers = []
      new.start = to_start + (shift.start.to_datetime - from_start)
      new.end = to_start + (shift.end.to_datetime - from_start)
      new.save
    end

    redirect_to action: :index
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
