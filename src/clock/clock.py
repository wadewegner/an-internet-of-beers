from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler
from urllib2 import Request, urlopen, URLError
import os, sys
import logging

def job_function():
    url = os.environ.get("TRIGGER_URL")
    request = Request(url)
    response = urlopen(request)
    output = response.read()

logging.basicConfig()

sched = BlockingScheduler()

# Schedule job_function to be called every two hours
sched.add_job(job_function, 'interval', seconds=60)

sched.start()