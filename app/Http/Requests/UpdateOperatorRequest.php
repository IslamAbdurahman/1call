<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOperatorRequest extends FormRequest
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
        // $this->route('operator') gets the User model from the route bindings
        $operatorId = $this->route('operator') ? $this->route('operator')->id : null;

        return [
            'name' => 'required|string|max:255',
            'extension' => 'required|string|unique:users,extension,' . $operatorId,
            'password' => 'nullable|string|min:4',
            'group_id' => 'required|exists:groups,id',
        ];
    }
}
