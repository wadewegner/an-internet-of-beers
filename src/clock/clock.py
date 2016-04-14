from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler
from urllib2 import Request, urlopen, URLError
import os, sys

def job_function():
    print("running ...")
    url = os.environ.get("TRIGGER_URL")
    request = Request(url)
    response = urlopen(request)
    kittens = response.read()
    print("Hello World")
    print(url)
    print(kittens)

sched = BlockingScheduler()

# Schedule job_function to be called every two hours
sched.add_job(job_function, 'interval', seconds=3)

sched.start()