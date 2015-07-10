  class RecordsController < ApplicationController
    def index
       @records = Record.all.to_json
    end
	
	def create
      @record = Record.new(record_params)

      if @record.save
        render json: @record
      else
        render json: @record.errors, status: :unprocessable_entity
      end
    end
	
	def destroy
      @record = Record.find(params[:id])
      @record.destroy
      head :no_content
    end
	
    def update
      @record = Record.find(params[:id])
      if @record.update(record_params)
        render json: @record
      else
        render json: @record.errors, status: :unprocessable_entity
      end
    end
	
	def essai_page
	end
	
	def essai_ajax
		respond_to do |format|
			format.html { render :nothing => true, :status => 200 }
		end
	end

    private

      def record_params
        params.require(:record).permit(:title, :amount, :date)
      end
  end