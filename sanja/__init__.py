import hashlib
import io

# noinspection PyUnresolvedReferences
ip = get_ipython()

registry = {}

def sanja_comm_target(comm, open_msg):
    data = open_msg['content']['data']
    if data['name'] in registry:
        lib = registry[data['name']]
        if lib['hash'] == data['hash']:
            comm.send(lib)
        else:
            comm.close({'reason': "hash_mismatch"})
    else:
        comm.close({'reason': 'unknown_name'})

def register_string(name, source):
    hash = hashlib.sha256(source.encode('utf-8')).hexdigest()
    registry[name] = {'source': source, 'hash': hash}

def register_file(name, file_or_path):
    if isinstance(file_or_path, str):
        with io.open(file_or_path, encoding='utf-8') as f:
            return register_file(name, f)

    register_string(name, file_or_path.read())
