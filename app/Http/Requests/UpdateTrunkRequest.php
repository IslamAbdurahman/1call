<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTrunkRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $trunkId = $this->route('trunk') ? $this->route('trunk')->id : null;
        return [
            'name' => 'required|string|unique:trunks,name,' . $trunkId,
            'host' => 'required|string',
            'port' => 'required|integer',
            'username' => 'nullable|string',
            'password' => 'nullable|string',
            'did' => 'nullable|string',
            'transport' => 'required|string',
            'context' => 'required|string',
            'is_active' => 'required|boolean',
        ];
    }
}
