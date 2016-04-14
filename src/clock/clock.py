from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler
from urllib2 import Request, urlopen, URLError
import os

def job_function():
    url = os.environ.get("TRIGGER_URL")
    request = Request(url)
    response = urlopen(request)
    kittens = response.read()
    print("Hello World")
    print(url)
    print(kittens)

sched = BlockingScheduler()

# Schedule job_function to be called every two hours
sched.add_job(job_function, 'interval', seconds=2)

sched.start()