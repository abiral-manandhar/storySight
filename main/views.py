from django.shortcuts import render

def play(request):

    return render(request, "main/index.html")
