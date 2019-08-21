$(document).ready(()=>{
            
            var selectedtaskid
            
            $("button.delete").click(function(){
                var confirm = window.confirm("Delete this task?")
                if(confirm){
                    var taskid = $(this).attr("data-id")
                    $.ajax({
                        url: "delete",
                        method: "post",
                        data: {
                            id: taskid
                        },
                        success: function(result){
                            console.log(result)
                            if(result.ok==1){
                                $("div[data-id='"+taskid+"']").remove()
                            }
                            else{
                                alert("something went wrong")
                            }
                        }
                    })
                }
            })
            
            $("button.finish").click(function(){
                var confirm = window.confirm("Finish this task?")
                if(confirm){
                    $("#finishid").val($(this).attr("data-id"))
                    $("#finishreward").val($(this).attr("data-reward"))
                    $("form#finish").submit()
                }
            })
            
            $("button.edit").click(function(){
                selectedtaskid = $(this).attr("data-id")
            })
            
            $("#edittasksubmitbutton").click(function(){
                $("#editid").val(selectedtaskid)
                $("form#edit").submit()
            })
        })