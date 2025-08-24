import requests
import json
import platform
import hashlib
import uuid
from typing import Dict, Any, Optional, Union
from datetime import datetime

class Client:
    def __init__(self, owner_id: str, app_id: str, app_name: str, version: str, base_url: str = "http://localhost:3000"):
        self.owner_id = owner_id
        self.app_id = app_id
        self.app_name = app_name
        self.version = version
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': f'{app_name}/{version} (Python SDK)',
            'Content-Type': 'application/json'
        })
        
    def _get_hardware_id(self) -> str:
        system_info = {
            'node': platform.node(),
            'processor': platform.processor(),
            'machine': platform.machine(),
            'system': platform.system(),
            'uuid': str(uuid.getnode())
        }
        h = hashlib.sha256()
        h.update(json.dumps(system_info, sort_keys=True).encode())
        return h.hexdigest()
    
    def _make_request(self, endpoint: str, method: str = 'GET', data: Optional[Dict] = None) -> Dict:
        url = f"{self.base_url}/api/{endpoint}"
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, params=data, timeout=10)
            else:
                response = self.session.request(method, url, json=data, timeout=10)
                
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            error_msg = str(e)
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_data = e.response.json()
                    error_msg = error_data.get('message', error_msg)
                except:
                    error_msg = e.response.text or error_msg
            
            return {
                'success': False,
                'message': f'Request failed: {error_msg}'
            }
    
    def validate_license(self, license_key: str) -> Dict:
        hwid = self._get_hardware_id()
        data = {
            'license_key': license_key,
            'hwid': hwid,
            'owner_id': self.owner_id,
            'app_id': self.app_id,
            'app_name': self.app_name
        }
        
        try:
            response = self._make_request('validate', 'POST', data)
            
            if 'expires_at' in response.get('license', {}) and response['license']['expires_at']:
                expires_at = datetime.fromisoformat(response['license']['expires_at'].replace('Z', '+00:00'))
                if datetime.now(expires_at.tzinfo) > expires_at:
                    raise Exception('License has expired')
            
            return response
            
        except Exception as e:
            if 'License has expired' in str(e):
                raise Exception('License has expired')
            raise
    
    def validate_key(self, license_key: str, hwid: Optional[str] = None) -> Dict[str, Any]:
        if not license_key:
            return {
                'success': False,
                'message': 'License key is required'
            }
            
        if not hwid:
            hwid = self._get_hardware_id()
            
        data = {
            'license_key': license_key,
            'hwid': hwid,
            'owner_id': self.owner_id,
            'app_id': self.app_id,
            'app_name': self.app_name
        }
        
        try:
            response = self._make_request('validate', 'POST', data)
            
            if response.get('success') and 'license' in response and response['license'].get('expires_at'):
                expires_at = datetime.fromisoformat(response['license']['expires_at'].replace('Z', '+00:00'))
                if datetime.now(expires_at.tzinfo) > expires_at:
                    return {
                        'success': False,
                        'message': 'License has expired',
                        'expired': True,
                        'license': response.get('license', {})
                    }
            
            return response
            
        except Exception as e:
            error_msg = str(e)
            if 'License has expired' in error_msg:
                return {
                    'success': False,
                    'message': 'License has expired',
                    'expired': True
                }
            return {
                'success': False,
                'message': f'Validation error: {error_msg}'
            }

