FROM ubuntu:20.04

ENV TZ=Europe/Kiev
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt update && apt install -y \
	curl \
	wget \
	git \
	sudo \
	python2 \
    openjdk-8-jre

RUN ln -s /usr/bin/python2 /usr/bin/python

# Install Redis
RUN sudo apt-get install -y build-essential && \
    mkdir oppia_tools && \
    cd oppia_tools && \
    wget https://download.redis.io/releases/redis-6.0.5.tar.gz && \
    tar xvzf redis-6.0.5.tar.gz && \
    mv redis-6.0.5 redis-cli-6.0.5 && \
    cd redis-cli-6.0.5 && \
    make

# Install pip
RUN curl https://bootstrap.pypa.io/pip/2.7/get-pip.py --output get-pip.py --output get-pip.py && python2 get-pip.py 'pip < 21.0'

RUN pip install \
    backports.functools-lru-cache==1.6.1 \
    beautifulsoup4==4.9.1 \
    bleach==3.1.5 \
    cachetools==3.1.1 \
    callbacks==0.3.0 \
    certifi==2020.6.20 \
    chardet==3.0.4 \
    enum34==1.1.10 \
    funcsigs==1.0.2 \
    future==0.18.2 \
    futures==3.3.0 \
    google-api-core==1.22.4 \
    google-auth==1.22.1 \
    google-cloud-tasks==1.5.0 \
    googleapis-common-protos==1.52.0 \
    googleappenginecloudstorageclient==1.9.22.1 \
    googleappenginemapreduce==1.9.22.0 \
    googleappenginepipeline==1.9.22.1 \
    graphy==1.0.0 \
    grpc-google-iam-v1==0.12.3 \
    grpcio==1.32.0 \
    html5lib==1.0.1 \
    idna==2.10 \
    mock==3.0.5 \
    mox==0.5.3 \
    mutagen==1.43.0 \
    packaging==20.4 \
    protobuf==3.13.0 \
    pyasn1==0.4.8 \
    pyasn1-modules==0.2.8 \
    pylatexenc==2.6 \
    pyparsing==2.4.7 \
    pytz==2020.1 \
    redis==3.5.3 \
    requests==2.24.0 \
    requests-mock==1.5.2 \
    requests-toolbelt==0.9.1 \
    rsa==4.5 \
    simplejson==3.17.0 \
    six==1.15.0 \
    soupsieve==1.9.5 \
    urllib3==1.25.11 \
    webapp2==3.0.0b1 \
    webencodings==0.5.1 \
    webob==1.8.6 \
    setuptools

# Install Google Chrome
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
	yes | apt install ./google-chrome-stable_current_amd64.deb

COPY . /oppia

RUN cd /oppia && bash scripts/install_prerequisites.sh;
RUN mkdir -p /oppia/.git/hooks/ && cd /oppia/.git/hooks/ && if [ ! -L pre-commit ]; then ln -s /oppia/scripts/pre_commit_hook.py pre-commit; fi

RUN cd /oppia && ls && python2 -m scripts.start --no_browser --disable_host_checking --prod_env --docker
RUN rm -rf /oppia

STOPSIGNAL SIGINT

ENTRYPOINT ["/oppia/entrypoint.sh"]
CMD ["python2", "-m", "scripts.start", "--no_browser", "--disable_host_checking", "--prod_env", "--save_datastore"]
