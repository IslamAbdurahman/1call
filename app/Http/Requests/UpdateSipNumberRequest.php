<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSipNumberRequest extends FormRequest
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
        $sipNumberId = $this->route('sipNumber') ? $this->route('sipNumber')->id : ($this->route('sip_number') ? $this->route('sip_number')->id : null);
        return [
            'number' => 'required|string|unique:sip_numbers,number,' . $sipNumberId,
            'group_id' => 'nullable|exists:groups,id',
        ];
    }
}
