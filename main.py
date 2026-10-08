import sys
import os
import importlib.util

# Asegurar que backend-ia-pdf esté en sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
sub_dir = os.path.join(current_dir, "backend-ia-pdf")
if sub_dir not in sys.path:
    sys.path.insert(0, sub_dir)

# Cargar el archivo main.py del subdirectorio de forma limpia sin colisión de nombres
target_file = os.path.join(sub_dir, "main.py")
spec = importlib.util.spec_from_file_location("sub_main", target_file)
sub_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sub_module)

app = sub_module.app
