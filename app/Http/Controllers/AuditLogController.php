<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AuditLog;

class AuditLogController extends Controller
{
    /*
    |----------------------------------------------------------
    | index — Liste tous les logs d'audit (Admin seulement)
    |----------------------------------------------------------
    | GET /api/audit-logs
    |----------------------------------------------------------
    */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $perPage = (int) $request->input('per_page', 20);
        $page    = max((int) $request->input('page', 1), 1);

        $query = AuditLog::with('user')->orderBy('created_at', 'desc');

        if ($request->filled('action')) {
            $query->where('action', $request->input('action'));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        $total = $query->count();

        $logs = $query
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(function ($log) {
                return [
                    'id'         => $log->id,
                    'action'     => $log->action,
                    'model'      => $log->model,
                    'model_id'   => $log->model_id,
                    'details'    => $log->details,
                    'ip'         => $log->ip,
                    'created_at' => $log->created_at,
                    'user' => $log->user ? [
                        'id'    => $log->user->id,
                        'name'  => $log->user->name,
                        'email' => $log->user->email,
                        'role'  => $log->user->role,
                    ] : null,
                ];
            });

        return response()->json([
            'data'     => $logs,
            'total'    => $total,
            'page'     => $page,
            'per_page' => $perPage,
        ]);
    }
}