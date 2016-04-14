from datetime import datetime

from apscheduler.schedulers.blocking import BlockingScheduler

from urllib2 import Request, urlopen, URLError

def job_function():
    print("Hello World")

    request = Request('http://localhost:5000/trigger')
    response = urlopen(request)
    kittens = response.read()
    print(kittens)

sched = BlockingScheduler()

# Schedule job_function to be called every two hours
sched.add_job(job_function, 'interval', seconds=2)

sched.start()